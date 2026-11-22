"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  Tag,
  Box,
  Loader2,
  X,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ProductForm } from "./ProductForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  oldPrice?: number | string | null;
  sku: string;
  stock: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  category: { id: string; name: string };
  brand: { id: string; name: string } | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface AdminProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  brands: Brand[];
}

const productSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 belgi"),
  slug: z.string().min(2, "Slug kamida 2 belgi"),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Narx 0 dan katta bo'lishi kerak"),
  oldPrice: z.number().optional().nullable(),
  sku: z.string().min(2, "SKU kamida 2 belgi"),
  stock: z.number().min(0, "Soni 0 dan katta bo'lishi kerak"),
  categoryId: z.string().min(1, "Kategoriya tanlanishi shart"),
  brandId: z.string().optional().nullable(),
  images: z.array(z.string()).min(1, "Kamida 1 rasm yuklanishi shart"),
  features: z.record(z.string()).optional(),
  specifications: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  order: z.number().default(0),
});

type ProductFormData = z.infer<typeof productSchema>;

const statusOptions = [
  { value: "", label: "Barcha holatlar" },
  { value: "active", label: "Faol" },
  { value: "inactive", label: "Nofaol" },
];

export function AdminProductsClient({ initialProducts, categories, brands }: AdminProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      shortDesc: "",
      description: "",
      price: 0,
      oldPrice: null,
      sku: "",
      stock: 0,
      categoryId: "",
      brandId: null,
      images: [],
      features: {},
      specifications: {},
      isActive: true,
      isFeatured: false,
      isNew: false,
      order: 0,
    },
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && product.isActive) ||
      (statusFilter === "inactive" && !product.isActive);
    const matchesCategory = !categoryFilter || product.category.id === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    reset({
      name: "",
      slug: "",
      shortDesc: "",
      description: "",
      price: 0,
      oldPrice: null,
      sku: "",
      stock: 0,
      categoryId: "",
      brandId: null,
      images: [],
      features: {},
      specifications: {},
      isActive: true,
      isFeatured: false,
      isNew: false,
      order: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      slug: product.slug,
      shortDesc: product.shortDesc || "",
      description: product.description || "",
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
      sku: product.sku,
      stock: product.stock,
      categoryId: product.category.id,
      brandId: product.brand?.id || null,
      images: product.images,
      features: (product.features as Record<string, string>) || {},
      specifications: (product.specifications as Record<string, any>) || {},
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      order: 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("O'chirishda xatolik");
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      alert("Mahsulotni o'chirishda xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Saqlashda xatolik");
      }

      const savedProduct = await res.json();

      if (editingProduct) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? savedProduct : p)));
      } else {
        setProducts([savedProduct, ...products]);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Mahsulotlar</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Mahsulotlarni qo'shish, tahrirlash va o'chirish</p>
        </div>
        <Button variant="primary" size="lg" onClick={openCreateModal} className="gap-2">
          <Plus className="w-5 h-5" />
          Yangi mahsulot
        </Button>
      </div>

      {/* Filters */}
      <div className={cn("bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-4", "space-y-4")}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <Input
              placeholder="Qidirish (nom, SKU)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 sm:flex-row flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Barcha kategoriyalar</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtrlar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-1">Mahsulotlar topilmadi</h3>
            <p className="text-dark-500 dark:text-dark-400">Birinchi mahsulotni qo'shing</p>
            <Button variant="primary" onClick={openCreateModal} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Mahsulot qo'shish
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-800/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Rasm</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Mahsulot</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Kategoriya</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Brend</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Narx</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Soni</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Holat</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Belgilar</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-dark-100 dark:bg-dark-800 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-dark-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <Link href={`/mahsulot/${product.slug}`} target="_blank" className="font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          {product.name}
                        </Link>
                        <p className="text-sm text-dark-500 dark:text-dark-400 truncate max-w-xs">{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-700 dark:text-dark-300">{product.category.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-700 dark:text-dark-300">{product.brand?.name || "—"}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-dark-700 dark:text-dark-300">{product.sku}</td>
                    <td className="px-6 py-4 font-semibold text-dark-900 dark:text-white">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", product.stock > 10 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : product.stock > 0 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400")}>
                        {product.stock} ta
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", product.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400")}>
                        {product.isActive ? "Faol" : "Nofaol"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {product.isFeatured && <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" title="Tavsiya etilgan">★</span>}
                        {product.isNew && <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" title="Yangi">NEW</span>}
                        {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" title="Chegirma">%</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(product)} className="p-2" aria-label="Tahrirlash">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="O'chirish" disabled={deletingId === product.id}>
                          {deletingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
            size="xl"
          >
            <ProductForm
              onSubmit={handleSubmit(onSubmit)}
              register={register}
              errors={errors}
              isLoading={isLoading}
              categories={categories}
              brands={brands}
              images={watch("images")}
              setValue={setValue}
              editingProduct={editingProduct}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Need to import Link
import Link from "next/link";
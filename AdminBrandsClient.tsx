"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  isActive: boolean;
  _count: { products: number };
  createdAt: string;
}

interface AdminBrandsClientProps {
  initialBrands: Brand[];
}

const brandSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 belgi"),
  slug: z.string().min(2, "Slug kamida 2 belgi"),
  description: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type BrandFormData = z.infer<typeof brandSchema>;

export function AdminBrandsClient({ initialBrands }: AdminBrandsClientProps) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", slug: "", description: "", logo: "", website: "", isActive: true },
  });

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase()) ||
    brand.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingBrand(null);
    reset({ name: "", slug: "", description: "", logo: "", website: "", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    reset({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || "",
      logo: brand.logo || "",
      website: brand.website || "",
      isActive: brand.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    reset();
  };

  const handleSubmitForm = async (data: BrandFormData) => {
    setSubmitting(true);
    try {
      const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : "/api/admin/brands";
      const method = editingBrand ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Xatolik yuz berdi");
      }

      const savedBrand = await res.json();

      if (editingBrand) {
        setBrands(brands.map((b) => (b.id === editingBrand.id ? savedBrand : b)));
      } else {
        setBrands([savedBrand, ...brands]);
      }

      closeModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ushbu brendni o'chirishga ishonchingiz komilmi?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "O'chirishda xatolik");
      }
      setBrands(brands.filter((b) => b.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Brendlar</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Brendlarni boshqarish</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Yangi brend
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <Input
            placeholder="Brend nomi yoki slug bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
        {filteredBrands.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-1">Brendlar topilmadi</h3>
            <p className="text-dark-500 dark:text-dark-400 mb-4">Hozircha hech qanday brend yo'q</p>
            <Button onClick={openCreateModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Birinchi brendni qo'shish
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {filteredBrands.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative p-4 rounded-xl border border-dark-100 dark:border-dark-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="relative w-16 h-16 rounded-xl bg-dark-50 dark:bg-dark-800 flex items-center justify-center overflow-hidden">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-dark-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(brand); }} className="p-1.5" aria-label="Tahrirlash">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(brand.id); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="O'chirish" disabled={deletingId === brand.id}>
                      {deletingId === brand.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-dark-900 dark:text-white truncate">{brand.name}</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400 font-mono">{brand.slug}</p>
                  {brand.description && (
                    <p className="text-sm text-dark-600 dark:text-dark-300 line-clamp-2">{brand.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-dark-100 dark:border-dark-800">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", brand.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400")}>
                      {brand.isActive ? "Faol" : "Nofaol"}
                    </span>
                    <span className="text-xs text-dark-400">{brand._count.products} mahsulot</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBrand ? "Brendni tahrirlash" : "Yangi brend qo'shish"}>
            <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Nomi *</label>
                  <Input {...register("name")} placeholder="Masalan: Hikvision" error={errors.name?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Slug *</label>
                  <Input {...register("slug")} placeholder="hikvision" error={errors.slug?.message} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Tavsif</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Brend haqida qisqacha ma'lumot..."
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Logo URL</label>
                  <Input {...register("logo")} placeholder="https://example.com/logo.png" type="url" error={errors.logo?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Veb-sayt</label>
                  <Input {...register("website")} placeholder="https://hikvision.com" type="url" error={errors.website?.message} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  id="isActive"
                  className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm text-dark-700 dark:text-dark-300 cursor-pointer">
                  Faol
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-dark-100 dark:border-dark-800">
                <Button type="button" variant="outline" onClick={closeModal}>Bekor qilish</Button>
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {editingBrand ? "Saqlash" : "Qo'shish"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
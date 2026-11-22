"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Tag,
  ArrowUpDown,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
  _count: { products: number };
  createdAt: string;
}

interface AdminCategoriesClientProps {
  initialCategories: Category[];
}

const categorySchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 belgi"),
  slug: z.string().min(2, "Slug kamida 2 belgi"),
  description: z.string().optional(),
  image: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function AdminCategoriesClient({ initialCategories }: AdminCategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image: "",
      order: 0,
      isActive: true,
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    reset({
      name: "",
      slug: "",
      description: "",
      image: "",
      order: categories.length,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      order: category.order,
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "O'chirishda xatolik");
      }
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Saqlashda xatolik");
      }

      const savedCategory = await res.json();

      if (editingCategory) {
        setCategories(categories.map((c) => (c.id === editingCategory.id ? savedCategory : c)));
      } else {
        setCategories([...categories, savedCategory]);
      }

      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (newOrder: Category[]) => {
    try {
      const res = await fetch("/api/admin/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: newOrder.map((c, i) => ({ id: c.id, order: i })) }),
      });
      if (!res.ok) throw new Error("Tartibni saqlashda xatolik");
      setCategories(newOrder);
    } catch (error) {
      alert("Tartibni o'zgartirishda xatolik");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Kategoriyalar</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Kategoriyalarni boshqarish va tartiblash</p>
        </div>
        <Button variant="primary" size="lg" onClick={openCreateModal} className="gap-2">
          <Plus className="w-5 h-5" />
          Yangi kategoriya
        </Button>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-1">Kategoriyalar yo'q</h3>
            <p className="text-dark-500 dark:text-dark-400">Birinchi kategoriyani qo'shing</p>
            <Button variant="primary" onClick={openCreateModal} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Kategoriya qo'shish
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-dark-800">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="flex items-center gap-4 p-4 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
              >
                <button
                  className="p-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 cursor-grab active:cursor-grabbing"
                  aria-label="Ko'chirish"
                >
                  <GripVertical className="w-5 h-5" />
                </button>

                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Link href={`/kategoriya/${category.slug}`} target="_blank" className="font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate block">
                      {category.name}
                    </Link>
                    <span className="text-sm text-dark-500 dark:text-dark-400 font-mono">{category.slug}</span>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", category.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400")}>
                      {category.isActive ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-dark-500 dark:text-dark-400">
                    <span>Mahsulotlar: <span className="font-medium text-dark-700 dark:text-dark-300">{category._count.products}</span></span>
                    <span>Tartib: <span className="font-medium text-dark-700 dark:text-dark-300">{category.order}</span></span>
                    {category.description && (
                      <span className="truncate max-w-xs">{category.description}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(category)} className="p-2" aria-label="Tahrirlash">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="O'chirish" disabled={deletingId === category.id || category._count.products > 0}>
                    {deletingId === category.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                  {category._count.products > 0 && (
                    <span className="text-xs text-dark-400 dark:text-dark-500 px-2 py-1 rounded bg-dark-100 dark:bg-dark-800">Mahsulotlar bor</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya qo'shish"}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                  Nomi <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Masalan: IP kameralar"
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="ip-kameralar"
                  error={errors.slug?.message}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Tavsif</label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Kategoriya tavsifi..."
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Rasm URL (ixtiyoriy)</label>
                <Input
                  id="image"
                  {...register("image")}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Tartib raqami</label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    {...register("order", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register("isActive")}
                    className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="font-medium text-dark-900 dark:text-white cursor-pointer">Faol</label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-dark-100 dark:border-dark-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
                <Button type="submit" variant="primary" disabled={isLoading} className="gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : editingCategory ? (
                    "Yangilash"
                  ) : (
                    "Qo'shish"
                  )}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Need to import Link
import Link from "next/link";
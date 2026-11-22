"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, Shield, User, UserCog, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER";
  createdAt: string;
  updatedAt: string;
}

interface AdminAdminsClientProps {
  initialAdmins: Admin[];
}

const adminSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 belgi"),
  email: z.string().email("Noto'g'ri email"),
  password: z.string().min(6, "Parol kamida 6 belgi").optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER"]).default("ADMIN"),
});

type AdminFormData = z.infer<typeof adminSchema>;

const roleConfig = {
  SUPER_ADMIN: { label: "Super Admin", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Shield },
  ADMIN: { label: "Admin", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: UserCog },
  MANAGER: { label: "Menejer", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: User },
};

export function AdminAdminsClient({ initialAdmins }: AdminAdminsClientProps) {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: "", email: "", password: "", role: "ADMIN" },
  });

  const passwordValue = watch("password");
  const isEditing = !!editingAdmin;

  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(search.toLowerCase()) ||
    admin.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingAdmin(null);
    reset({ name: "", email: "", password: "", role: "ADMIN" });
    setIsModalOpen(true);
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    reset({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
    reset();
  };

  const handleSubmitForm = async (data: AdminFormData) => {
    setSubmitting(true);
    try {
      const submitData = isEditing
        ? { ...data, password: data.password || undefined }
        : data;

      const url = editingAdmin ? `/api/admin/admins/${editingAdmin.id}` : "/api/admin/admins";
      const method = editingAdmin ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Xatolik yuz berdi");
      }

      const savedAdmin = await res.json();

      if (editingAdmin) {
        setAdmins(admins.map((a) => (a.id === editingAdmin.id ? savedAdmin : a)));
      } else {
        setAdmins([savedAdmin, ...admins]);
      }

      closeModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ushbu adminni o'chirishga ishonchingiz komilmi?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "O'chirishda xatolik");
      }
      setAdmins(admins.filter((a) => a.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Adminlar</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Admin foydalanuvchilarni boshqarish</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Yangi admin
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <Input
            placeholder="Ism yoki email bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
        {filteredAdmins.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-1">Adminlar topilmadi</h3>
            <p className="text-dark-500 dark:text-dark-400 mb-4">Hozircha hech qanday admin yo'q</p>
            <Button onClick={openCreateModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Birinchi adminni qo'shish
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-800/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Yaratilgan sana</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                {filteredAdmins.map((admin, index) => {
                  const config = roleConfig[admin.role];
                  const Icon = config.icon;

                  return (
                    <motion.tr
                      key={admin.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="font-medium text-dark-900 dark:text-white">{admin.name}</p>
                            <p className="text-xs text-dark-500 dark:text-dark-400">ID: {admin.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-700 dark:text-dark-300">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.color)}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-500 dark:text-dark-400 whitespace-nowrap">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(admin)} className="p-2" aria-label="Tahrirlash">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(admin.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="O'chirish" disabled={deletingId === admin.id}>
                            {deletingId === admin.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAdmin ? "Adminni tahrirlash" : "Yangi admin qo'shish"}>
            <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">To'liq ism *</label>
                  <Input {...register("name")} placeholder="Masalan: Ali Valiyev" error={errors.name?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Email *</label>
                  <Input {...register("email")} type="email" placeholder="admin@example.com" error={errors.email?.message} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                  Parol {isEditing ? "(o'zgartirish uchun to'ldiring)" : "*"}
                </label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder={isEditing ? "Yangi parol (ixtiyoriy)" : "Kamida 6 belgi"}
                    error={errors.password?.message}
                  />
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Rol *</label>
                <select
                  {...register("role")}
                  className="w-full px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Menejer</option>
                </select>
                {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-dark-100 dark:border-dark-800">
                <Button type="button" variant="outline" onClick={closeModal}>Bekor qilish</Button>
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {editingAdmin ? "Saqlash" : "Qo'shish"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
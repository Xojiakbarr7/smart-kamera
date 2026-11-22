"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Bot, Globe, Phone, Mail, MapPin, Shield, Bell, Palette, CreditCard, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string | null;
  siteLogo: string | null;
  siteFavicon: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactAddress: string | null;
  telegramChatId: string | null;
  telegramEnabled: boolean;
  freeDelivery: boolean;
  minOrderForFreeDelivery: number | null;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminSettingsClientProps {
  initialSettings: SiteSettings;
}

const settingsSchema = z.object({
  siteName: z.string().min(1, "Sayt nomi majburiy"),
  siteDescription: z.string().optional(),
  siteLogo: z.string().url().optional().or(z.literal("")),
  siteFavicon: z.string().url().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactAddress: z.string().optional(),
  telegramChatId: z.string().optional(),
  telegramEnabled: z.boolean().default(false),
  freeDelivery: z.boolean().default(true),
  minOrderForFreeDelivery: z.number().optional(),
  currency: z.string().default("UZS"),
  timezone: z.string().default("Asia/Tashkent"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const sections = [
  {
    id: "general",
    label: "Umumiy",
    icon: Settings,
    fields: ["siteName", "siteDescription", "siteLogo", "siteFavicon"],
  },
  {
    id: "contact",
    label: "Kontakt ma'lumotlari",
    icon: Globe,
    fields: ["contactPhone", "contactEmail", "contactAddress"],
  },
  {
    id: "telegram",
    label: "Telegram Bot",
    icon: Bot,
    fields: ["telegramEnabled", "telegramChatId"],
  },
  {
    id: "delivery",
    label: "Yetkazib berish",
    icon: CreditCard,
    fields: ["freeDelivery", "minOrderForFreeDelivery"],
  },
  {
    id: "localization",
    label: "Lokalizatsiya",
    icon: Palette,
    fields: ["currency", "timezone"],
  },
];

const fieldLabels: Record<string, string> = {
  siteName: "Sayt nomi",
  siteDescription: "Sayt tavsifi",
  siteLogo: "Logo URL",
  siteFavicon: "Favicon URL",
  contactPhone: "Telefon",
  contactEmail: "Email",
  contactAddress: "Manzil",
  telegramEnabled: "Telegram botni yoqish",
  telegramChatId: "Telegram Chat ID",
  freeDelivery: "Bepul yetkazib berish",
  minOrderForFreeDelivery: "Bepul yetkazib berish uchun minimal summa",
  currency: "Valyuta",
  timezone: "Vaqt mintaqasi",
};

const fieldPlaceholders: Record<string, string> = {
  siteName: "SecureCam",
  siteDescription: "Aqlli kuzatuv kameralari do'koni",
  siteLogo: "https://example.com/logo.png",
  siteFavicon: "https://example.com/favicon.ico",
  contactPhone: "+998 90 123 45 67",
  contactEmail: "info@securecam.uz",
  contactAddress: "Toshkent sh., Yunusobod tumani...",
  telegramChatId: "-1001234567890",
  minOrderForFreeDelivery: "0",
  currency: "UZS",
  timezone: "Asia/Tashkent",
};

export function AdminSettingsClient({ initialSettings }: AdminSettingsClientProps) {
  const [activeSection, setActiveSection] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: initialSettings.siteName,
      siteDescription: initialSettings.siteDescription || "",
      siteLogo: initialSettings.siteLogo || "",
      siteFavicon: initialSettings.siteFavicon || "",
      contactPhone: initialSettings.contactPhone || "",
      contactEmail: initialSettings.contactEmail || "",
      contactAddress: initialSettings.contactAddress || "",
      telegramEnabled: initialSettings.telegramEnabled,
      telegramChatId: initialSettings.telegramChatId || "",
      freeDelivery: initialSettings.freeDelivery,
      minOrderForFreeDelivery: initialSettings.minOrderForFreeDelivery || 0,
      currency: initialSettings.currency,
      timezone: initialSettings.timezone,
    },
  });

  const telegramEnabled = watch("telegramEnabled");
  const freeDelivery = watch("freeDelivery");

  const handleSubmitForm = async (data: SettingsFormData) => {
    setSubmitting(true);
    setSaved(false);
    try {
      const submitData = {
        ...data,
        minOrderForFreeDelivery: data.minOrderForFreeDelivery || 0,
        telegramChatId: data.telegramChatId || null,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Xatolik yuz berdi");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      reset(data);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (fieldName: string) => {
    const error = errors[fieldName as keyof SettingsFormData];
    const isCheckbox = fieldName === "telegramEnabled" || fieldName === "freeDelivery";

    if (isCheckbox) {
      return (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register(fieldName)}
            id={fieldName}
            className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor={fieldName} className="text-sm font-medium text-dark-700 dark:text-dark-300 cursor-pointer">
            {fieldLabels[fieldName]}
          </label>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
          {fieldLabels[fieldName]}
        </label>
        <Input
          {...register(fieldName)}
          placeholder={fieldPlaceholders[fieldName]}
          error={error?.message}
          type={fieldName.includes("Email") ? "email" : fieldName.includes("Phone") ? "tel" : "text"}
          disabled={fieldName === "telegramChatId" && !telegramEnabled}
          className={cn(fieldName === "telegramChatId" && !telegramEnabled && "opacity-50 cursor-not-allowed")}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Sozlamalar</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Sayt sozlamalarini boshqarish</p>
        </div>
        <Button onClick={() => handleSubmit(handleSubmitForm)()} disabled={submitting || !isDirty} className="gap-2">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Saqlash
        </Button>
      </div>

      {/* Saved Toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Sozlamalar saqlandi
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="lg:w-64 border-r border-dark-100 dark:border-dark-800 p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm font-medium",
                    activeSection === section.id
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white"
                  )}
                >
                  <section.icon className="w-5 h-5 flex-shrink-0" />
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
              {sections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-100 dark:border-dark-800">
                    <section.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-xl font-semibold text-dark-900 dark:text-white">{section.label}</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {section.fields.map((field) => (
                      <div key={field} className={field === "telegramEnabled" || field === "freeDelivery" ? "sm:col-span-2" : ""}>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}

              <div className="flex gap-3 justify-end pt-6 border-t border-dark-100 dark:border-dark-800">
                <Button type="submit" disabled={submitting || !isDirty} className="gap-2 min-w-[160px]">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isDirty ? "O'zgarishlarni saqlash" : "Hech qanday o'zgarish yo'q"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import CheckCircle
import { CheckCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
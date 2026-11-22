"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Truck, CreditCard, Phone, MapPin, User } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Modal } from "./Modal";
import { cn, formatPrice } from "@/lib/utils";

const orderSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta harf bo'lishi kerak"),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, "To'g'ri telefon raqam kiriting"),
  email: z.string().email("To'g'ri email kiriting").optional().or(z.literal("")),
  address: z.string().min(10, "Manzil batafsil kiriting (shahar, tuman, ko'cha, uy)"),
  comment: z.string().optional(),
  productId: z.string(),
  quantity: z.number().min(1).default(1),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  images: string[];
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export function OrderModal({ isOpen, onClose, product }: OrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [orderNumber, setOrderNumber] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 1,
      productId: product?.id || "",
    },
  });

  useEffect(() => {
    if (isOpen && product) {
      reset({
        name: "",
        phone: "",
        email: "",
        address: "",
        comment: "",
        productId: product.id,
        quantity: 1,
      });
      setSubmitStatus("idle");
    }
  }, [isOpen, product, reset]);

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Buyurtma berishda xatolik");
      }

      setOrderNumber(result.orderNumber);
      setSubmitStatus("success");
    } catch (error) {
      console.error("Order error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitStatus === "success") {
      // Wait a bit before closing on success
      setTimeout(() => {
        onClose();
        reset();
      }, 2000);
    } else {
      onClose();
      reset();
    }
  };

  const totalPrice = product ? Number(product.price) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={true}
          onClose={handleClose}
          title={submitStatus === "success" ? "Buyurtma qabul qilindi!" : "Buyurtma berish"}
          description={
            submitStatus === "success"
              ? `Buyurtma raqami: <strong>${orderNumber}</strong>. Tez orada operatorlarimiz siz bilan bog'lanadi.`
              : product
              ? `${product.name} — ${formatPrice(totalPrice)}`
              : "Mahsulot tanlang"
          }
          size="md"
          closeOnOverlayClick={submitStatus !== "submitting"}
        >
          {submitStatus === "success" ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
                Rahmat, {register("name").value || "hurmatli mijoz"}!
              </h3>
              <p className="text-dark-600 dark:text-dark-400 mb-6">
                Buyurtmangiz muvaffaqiyatli qabul qilindi. Operatorlarimiz 15 daqiqa ichida siz bilan bog'lanishadi.
              </p>
              <div className="bg-primary-50 dark:primary-900/20 rounded-xl p-4 text-left">
                <p className="font-medium text-primary-900 dark:text-primary-100">
                  Buyurtma raqami: <span className="font-mono">{orderNumber}</span>
                </p>
                <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                  Yetkazib berish bepul. To'lov taqdim etilganda naqd yoki karta orqali amalga oshiriladi.
                </p>
              </div>
            </div>
          ) : submitStatus === "error" ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Xatolik yuz berdi</h3>
              <p className="text-dark-600 dark:text-dark-400 mb-6">
                Buyurtma yuborishda muammo yuz berdi. Iltimos, qayta urinib ko'ring yoki operator bilan bog'laning.
              </p>
              <Button variant="primary" onClick={() => setSubmitStatus("idle")}>
                Qayta urinish
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                {product?.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-dark-100 dark:bg-dark-800 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-900 dark:text-white truncate">{product?.name}</p>
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatPrice(totalPrice)}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Ismingiz *"
                  placeholder="Mas'udbek"
                  error={errors.name?.message}
                  {...register("name")}
                  autoComplete="name"
                />
                <Input
                  label="Telefon raqam *"
                  placeholder="+998 90 123 45 67"
                  error={errors.phone?.message}
                  {...register("phone")}
                  autoComplete="tel"
                />
              </div>

              <Input
                label="Email (ixtiyoriy)"
                placeholder="email@example.com"
                type="email"
                error={errors.email?.message}
                {...register("email")}
                autoComplete="email"
              />

              <Input
                label="Yetkazib berish manzili *"
                placeholder="Toshkent sh., Yunusobod t., Amir Temur ko'ch., 45-uy, 12-kv"
                error={errors.address?.message}
                {...register("address")}
                autoComplete="street-address"
                helperText="Shahar, tuman, ko'cha, uy, kvartira ni batafsil kiriting"
              />

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                  Qo'shimcha izoh (ixtiyoriy)
                </label>
                <textarea
                  {...register("comment")}
                  rows={3}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all duration-200",
                    "bg-white dark:bg-dark-800",
                    "text-dark-900 dark:text-dark-100",
                    "placeholder:text-dark-400 dark:placeholder:text-dark-500",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                    "border-dark-200 dark:border-dark-700 hover:border-dark-300 dark:hover:border-dark-600"
                  )}
                  placeholder="Masalan: Ertalab 10:00 dan oldin qo'ng'iroq qiling, eshik kodi 1234..."
                />
              </div>

              <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-600 dark:text-dark-400">Mahsulot narxi</span>
                  <span className="font-medium text-dark-900 dark:text-white">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    Yetkazib berish
                  </span>
                  <span className="font-medium">Bepul</span>
                </div>
                <div className="border-t border-dark-200 dark:border-dark-700 pt-2 flex items-center justify-between">
                  <span className="font-semibold text-dark-900 dark:text-white">Jami</span>
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-900/30">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-amber-900 dark:text-amber-100 space-y-1">
                  <p className="font-medium">To'lov usuli: Naqd / Karta (taqdim etilganda)</p>
                  <p>Yetkazib berish bepul. To'lov mahsulot qo'lingizga yetgach amalga oshiriladi.</p>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isSubmitting}
              >
                Buyurtma berish
              </Button>
            </form>
          )}
        </Modal>
      )}
    </AnimatePresence>
  );
}
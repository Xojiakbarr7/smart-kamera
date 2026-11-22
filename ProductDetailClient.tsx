"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, Check, Truck, Shield, RotateCcw, Star, MapPin, Phone, Eye, Maximize } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDesc?: string | null;
  price: number | string;
  oldPrice?: number | string | null;
  sku: string;
  stock: number;
  images: string[];
  features?: Record<string, string> | null;
  specifications?: Record<string, any> | null;
  isNew?: boolean;
  isFeatured?: boolean;
  category?: { name: string; slug: string };
  brand?: { name: string; slug: string } | null;
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.oldPrice!)) * 100)
    : 0;

  const specs = product.specifications as Record<string, string> || {};
  const features = product.features as Record<string, string> || {};

  const mainSpecs = [
    { key: "Rezolyutsiya", value: specs.resolution || features.resolution },
    { key: "Sensor", value: specs.sensor || features.sensor },
    { key: "Lins", value: specs.lens || features.lens },
    { key: "Ko'rinish masofasi (IR)", value: specs.nightVision || features.nightVision },
    { key: "Kuzatuv burchagi", value: specs.viewAngle || features.viewAngle },
    { key: "Video kodek", value: specs.videoCodec || features.videoCodec },
    { key: "Ulanish", value: specs.connectivity || features.connectivity },
    { key: "Kuvvat manbai", value: specs.power || features.power },
    { key: "Ishlash temperaturalari", value: specs.operatingTemp || features.operatingTemp },
    { key: "Himoya darajasi", value: specs.ipRating || features.ipRating },
    { key: "O'lchamlar", value: specs.dimensions || features.dimensions },
    { key: "Og'irlik", value: specs.weight || features.weight },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      {/* Breadcrumb */}
      <nav className="pt-28 pb-4 px-4 md:px-6 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-dark-100 dark:border-dark-800 sticky top-0 z-30" aria-label="Breadcrumb">
        <div className="container flex items-center gap-2 text-sm">
          <Link href="/" className="text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Bosh sahifa</Link>
          <ChevronRight className="w-4 h-4 text-dark-300 dark:text-dark-600 flex-shrink-0" />
          <Link href="/katalog" className="text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Katalog</Link>
          <ChevronRight className="w-4 h-4 text-dark-300 dark:text-dark-600 flex-shrink-0" />
          {product.category && (
            <>
              <Link href={`/kategoriya/${product.category.slug}`} className="text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{product.category.name}</Link>
              <ChevronRight className="w-4 h-4 text-dark-300 dark:text-dark-600 flex-shrink-0" />
            </>
          )}
          <span className="text-dark-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
        </div>
      </nav>

      {/* Product Gallery & Info */}
      <section className="section-sm">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-800">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {product.images[selectedImage] ? (
                      <Image
                        src={product.images[selectedImage]}
                        alt={`${product.name} - Rasm ${selectedImage + 1}`}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-dark-400">
                        <Eye className="w-16 h-16" />
                      </div>
                    )}
                    <button
                      onClick={() => setIsZoomOpen(true)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm text-dark-600 hover:text-dark-900 dark:hover:text-white transition-colors"
                      aria-label="Kattalashtirish"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                        i === selectedImage
                          ? "border-primary-500 ring-2 ring-primary-500/20"
                          : "border-transparent hover:border-primary-300 dark:hover:border-primary-700"
                      )}
                      aria-label={`Rasm ${i + 1}`}
                      aria-current={i === selectedImage ? "true" : "false"}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-3 py-1 text-sm font-semibold text-white bg-primary-600 rounded-full shadow-lg">Yangi</span>
                )}
                {product.isFeatured && (
                  <span className="px-3 py-1 text-sm font-semibold text-white bg-amber-500 rounded-full shadow-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Tavsiya
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-full shadow-lg">-{discountPercent}%</span>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:sticky lg:top-28"
            >
              <div className="space-y-6">
                {/* Category & Brand */}
                <div className="flex flex-wrap items-center gap-2">
                  {product.category && (
                    <Link
                      href={`/kategoriya/${product.category.slug}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {product.category.name}
                    </Link>
                  )}
                  {product.brand && (
                    <>
                      <span className="text-dark-300 dark:text-dark-600">/</span>
                      <Link
                        href={`/brend/${product.brand.slug}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        {product.brand.name}
                      </Link>
                    </>
                  )}
                  <span className="text-sm text-dark-400 ml-2">SKU: {product.sku}</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white leading-tight">
                  {product.name}
                </h1>

                {/* Short Description */}
                {product.shortDesc && (
                  <p className="text-lg text-dark-600 dark:text-dark-400 leading-relaxed">
                    {product.shortDesc}
                  </p>
                )}

                {/* Price */}
                <div className="flex flex-wrap items-baseline gap-4">
                  <span className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl line-through text-dark-400 dark:text-dark-500">
                      {formatPrice(product.oldPrice!)}
                    </span>
                  )}
                  {product.stock > 0 ? (
                    <span className="badge badge-success">Omborda: {product.stock} ta</span>
                  ) : (
                    <span className="badge badge-danger">Tugagan</span>
                  )}
                </div>

                {/* Benefits */}
                <div className="border-t border-b border-dark-100 dark:border-dark-800 py-4 space-y-3">
                  {[
                    { icon: Truck, title: "Bepul yetkazib berish", desc: "Toshkentda 1 kun, viloyatlarga 2-3 kun" },
                    { icon: Shield, title: "Rasmiy kafolat", desc: "1-3 yil kafolat va servis xizmati" },
                    { icon: RotateCcw, title: "14 kun qaytarish", desc: "Bepul qaytarish va almashtirish" },
                    { icon: MapPin, title: "O'rnatuv xizmati", desc: "Professional o'rnatuv va sozlash" },
                  ].map((benefit) => (
                    <div key={benefit.title} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white">{benefit.title}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Button */}
                <Button
                  variant="primary"
                  size="xl"
                  className="w-full gap-3 py-4 text-lg"
                  disabled={product.stock === 0}
                  onClick={() => window.dispatchEvent(new CustomEvent("open-order-modal", { detail: product }))}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {product.stock === 0 ? "Tugagan — xabardor bo'lish" : "Buyurtma berish"}
                </Button>

                {/* Or call */}
                <div className="text-center text-sm text-dark-500 dark:text-dark-400">
                  <span>Yoki qo'ng'iroq qiling: </span>
                  <a href="tel:+998901234567" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                    +998 90 123 45 67
                  </a>
                </div>

                {/* Share */}
                <div className="flex items-center gap-4 pt-4 border-t border-dark-100 dark:border-dark-800">
                  <span className="text-sm text-dark-500 dark:text-dark-400">Ulashish:</span>
                  <div className="flex gap-2">
                    <a href={`https://telegram.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener" className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors" aria-label="Telegramda ulashish">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm5.5 8.5h-3v3h-2v-3h-3v-2h3v-3h2v3h3v2z"/></svg>
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(product.name + " " + window.location.href)}`} target="_blank" rel="noopener" className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors" aria-label="WhatsAppda ulashish">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.247-.59-.497-.968-.597-1.118-.099-.148 0-.297.099-.446.099-.149.248-.198.447-.198.1.049 3.672 2.405 5.337 3.885.97.896 1.787 1.842 2.583 2.837.299.397.447.841.497 1.091.049.247-.049.418-.198.542-.149.149-.471.198-.735.074-.399-.198-1.595-.868-2.06-1.02-.422-.15-1.134-.148-1.545-.149-.075 0-.198 0-.323.075-.124.074-.272.223-.42.348-.149.125-.273.247-.447.372-.174.124-.372.075-.57.075-.198 0-.397-.049-.57-.174-.174-.125-.348-.323-.42-.448-.075-.124-.075-.248-.025-.373.05-.125.222-.198.57-.322.174-.124 1.255-.795 1.48-1.02.247-.247.372-.546.372-1.02 0-.274-.125-.52-.298-.669-.173-.149-.422-.198-.67-.174-.247.025-.62.273-.94.622-.498.546-1.478 1.788-1.603 2.11l-.05.125c-.125.372-.222.695-.273.993-.049.297-.173.643-.323.816-.149.174-.398.348-.795.546-.398.199-.895.198-1.468.149l-.323-.025-.174.025c-.173.025-.422.124-.644.272-.223.15-.497.324-.816.573-.32.247-.695.546-1.118.795-.422.248-.968.248-1.39.074-.125 0-.323-.074-.547-.198-.223-.125-.547-.323-.845-.472-.298-.149-.622-.272-.993-.422-.372-.149-.77-.223-1.19-.323-.422-.099-.915-.074-1.488.075-.574.149-1.228.546-1.84 1.195-.518.546-.915 1.165-1.19 1.544-.273.373-.447.643-.596.868-.149.223-.223.472-.198.747.025.273.198.694.547 1.092.348.398.993.92 1.468 1.366.473.448 1.19 1.092 1.788 1.788.598.695 1.195 1.47 1.678 2.142.48.67.816 1.365 1.092 2.018.248.57.372 1.22.372 1.544 0 .52-.149 1.19-.546 1.71-.398.52-1.02.943-1.76 1.29-.52.248-1.092.323-1.71.149-.695-.173-1.39-.573-2.01-1.164-.647-.62-1.165-1.29-1.617-2.01-.45-.718-.795-1.49-1.07-2.312-.274-.816-.447-1.595-.52-2.36-.075-.768-.149-1.492-.149-2.167 0-.248.025-.497.075-.694.05-.199.223-.447.547-.546.323-.099.67-.198 1.018-.198.174 0 .422.025.695.148.272.125.52.248.795.348.272.1.547.222.87.348.323.125.647.272.94.447.297.173.57.322.892.448.323.124.647.198.968.174.222-.025.398-.173.52-.422.123-.247.198-.546.173-.77-.025-.224-.224-.497-.547-.646-.322-.149-.718-.248-1.14-.322-.423-.075-.87-.148-1.342-.148-.298 0-.57.075-.817.198-.248.124-.472.373-.67.672-.198.298-.372.62-.52.993-.149.372-.174.747-.174 1.092 0 .324.025.647.173.97.148.323.422.597.795.795.372.198.77.323 1.19.323.223 0 .447-.05.644-.149.198-.099.397-.223.596-.372.198-.148.372-.297.547-.447.174-.149.323-.323.448-.52.124-.198.198-.422.174-.648-.025-.224-.173-.497-.448-.646-.273-.149-.57-.247-.892-.247-.125 0-.223.025-.348.074-.125.05-.223.174-.323.323-.1.149-.223.373-.323.622-.099.248-.198.497-.198.747 0 .248.025.497.174.72.148.223.422.422.795.57.373.148.747.248 1.14.248.398 0 .77-.099 1.118-.322.347-.223.646-.472.892-.747.248-.274.472-.597.67-.947.199-.348.373-.72.52-1.118.149-.398.248-.795.298-1.19.05-.398.074-.795.074-1.19 0-.398-.025-.795-.074-1.19-.05-.398-.173-.795-.322-1.19-.149-.397-.372-.795-.596-1.19-.223-.398-.497-.795-.795-1.19-.297-.398-.596-.795-.892-1.19-.298-.398-.57-.795-.868-1.19-.298-.398-.596-.795-.892-1.19-.298-.398-.596-.795-.892-1.19z"/></svg>
                    </a>
                    <button className="p-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors" aria-label="Nusxa ko'chirish">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Description & Specs Tabs */}
      <section className="section-sm bg-white dark:bg-dark-950 border-t border-dark-100 dark:border-dark-800">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-1 bg-dark-100 dark:bg-dark-800 rounded-xl p-1 mb-8" role="tablist">
              {[
                { id: "description", label: "Tavsif", icon: null },
                { id: "specs", label: "Xususiyatlar", icon: null },
                { id: "specs-full", label: "To'liq xarakteristikalar", icon: null },
              ].map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={false}
                  className="px-6 py-3 rounded-lg text-sm font-medium text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-dark dark:prose-invert max-w-none"
            >
              {product.description ? (
                <div className="whitespace-pre-wrap">{product.description}</div>
              ) : (
                <div className="space-y-4 text-dark-600 dark:text-dark-400">
                  <p>{product.name} — bu zamonaviy smart kuzatuv kamerasi bo'lib, uyingiz, ofisingiz yoki biznesingiz xavfsizligi uchun ideal yechimdir.</p>
                  <p>Asosiy afzalliklari:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Yuqori rezolyutsiyali video yazib borish</li>
                    <li>Kun/tun rejimi va IR yoritish</li>
                    <li>Mobil ilova orqali uzak nazorat</li>
                    <li>Haraketni aniqlash va xabardorlik</li>
                    <li>Bulut va lokal saqlash imkoniyati</li>
                    <li>Oson o'rnatuv va sozlash</li>
                  </ul>
                  <p>Mahsulotga 1-3 yil rasmiy kafolat beriladi. Bepul yetkazib berish va professional o'rnatuv xizmati ham mavjud.</p>
                </div>
              )}
            </motion.div>

            {/* Key Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-12"
            >
              <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Asosiy xususiyatlar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(features).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3 p-4 rounded-xl bg-dark-50 dark:bg-dark-900 border border-dark-100 dark:border-dark-800">
                    <Check className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-dark-900 dark:text-white">{key}</p>
                      <p className="text-sm text-dark-500 dark:text-dark-400">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Full Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12"
            >
              <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">To'liq texnik xarakteristikalar</h3>
              <div className="rounded-xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                <dl className="divide-y divide-dark-100 dark:divide-dark-800">
                  {mainSpecs.map((spec) => (
                    <div key={spec.key} className="grid grid-cols-1 md:grid-cols-[1fr_2fr] px-6 py-4 hover:bg-dark-50 dark:hover:bg-dark-900/50 transition-colors">
                      <dt className="font-medium text-dark-700 dark:text-dark-300 py-2 border-b border-dark-100 dark:border-dark-800 md:border-b-0 md:border-r dark:border-r">
                        {spec.key}
                      </dt>
                      <dd className="text-dark-600 dark:text-dark-400 py-2">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-sm" aria-labelledby="related-heading">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <h2 id="related-heading" className="text-3xl font-bold text-dark-900 dark:text-white">
                Shunga o'xshash mahsulotlar
              </h2>
              <Button variant="ghost" asChild>
                <Link href="/katalog">Barchasi <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="product-grid">
              {relatedProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
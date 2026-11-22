import { Metadata } from "next";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Truck, Headphones, Star, Camera, Wifi, Signal, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Smart kuzatuv kameralari — Rasmiy kafolat, bepul yetkazib berish",
  description: "IP, WiFi, 4G, AHD kameralar va NVR videoregistratorlar. O'zbekiston bo'ylab bepul yetkazib berish, 1-3 yil kafolat, professional o'rnatuv.",
};

const features = [
  { icon: Shield, title: "Rasmiy kafolat", desc: "Barcha mahsulotlarga 1-3 yil rasmiy kafolat va servis xizmati" },
  { icon: Truck, title: "Bepul yetkazib berish", desc: "Toshkent shahrida 1 kun ichida, viloyatlarga 2-3 kun ichida" },
  { icon: Headphones, title: "Professional yordam", desc: "Tanlash, o'rnatuv va sozlash bo'yicha bepul maslahat" },
  { icon: Star, title: "Sifat kafolati", desc: "Faqat tekshirilgan brendlar: Hikvision, Dahua, Ezviz, Tapo, Reolink" },
];

const categories = [
  { name: "IP kameralar", slug: "ip-kameralar", icon: Camera, desc: "Professional monitoring", count: "45+ mahsulot" },
  { name: "WiFi kameralar", slug: "wifi-kameralar", icon: Wifi, desc: "Simkartsiz, o'rnatish oson", count: "32+ mahsulot" },
  { name: "4G kameralar", slug: "4g-kameralar", icon: Signal, desc: "Internet yo'q joylarda", count: "18+ mahsulot" },
  { name: "AHD/TVI kameralar", slug: "ahd-kameralar", icon: Zap, desc: "Koaksial kabel uchun", count: "28+ mahsulot" },
  { name: "NVR registratorlar", slug: "nvr", icon: Camera, desc: "Videosaqlovchi qurilmalar", count: "22+ mahsulot" },
  { name: "Aksessuarlar", slug: "aksessuarlar", icon: Camera, desc: "Kabel, blok pitaniya, o'rnatuv", count: "60+ mahsulot" },
];

export default async function HomePage() {
  // Fetch featured and new products
  const [featuredProducts, newProducts, categoriesWithCount] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: 8,
      orderBy: { order: "asc" },
      include: { category: true, brand: true },
    }),
    prisma.product.findMany({
      where: { isNew: true, isActive: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { category: true, brand: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white dark:from-dark-900 dark:via-dark-950 dark:to-dark-950">
        {/* Background decorations */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl animate-pulse-glow" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-30 hero-pattern" aria-hidden="true" />

        <div className="relative container px-4 md:px-6 py-20 md:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                Yangi kolleksiya 2024 — 4K IP kameralar shtatda
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-dark-900 dark:text-white leading-tight mb-6"
            >
              Smart kuzatuv kameralari
              <br />
              <span className="text-gradient">professional darajada</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
              className="text-lg md:text-xl text-dark-600 dark:text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              IP, WiFi, 4G va AHD kameralar, NVR videoregistratorlar. Rasmiy kafolat, bepul yetkazib berish va professional o'rnatuv xizmati.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="xl" asChild className="gap-3">
                <Link href="/katalog">
                  Katalogni ko'rish
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild className="gap-3">
                <Link href="#categories">
                  Kategoriyalar
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-dark-500 dark:text-dark-400"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                <span>Rasmiy kafolat 1-3 yil</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-500" />
                <span>Bepul yetkazib berish</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-primary-500" />
                <span>24/7 qo'llab-quvvatlash</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary-500 fill-current" />
                <span>4.9/5 reyting (200+ sharh)</span>
              </div>
            </motion.div>
          </div>

          {/* Floating product showcase */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
            className="mt-20 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { title: "4K IP Kamera", desc: "8MP, ColorVu, 40m IR", price: "2,450,000", badge: "Eng mashhur", gradient: "from-primary-500 to-primary-700" },
                { title: "WiFi PTZ Kamera", desc: "360° aylanish, avto-kuzatuv", price: "1,890,000", badge: "Yangi", gradient: "from-emerald-500 to-teal-600" },
                { title: "4G Solar Kamera", desc: "Quydiruvpanelsiz, 10000mAh", price: "3,200,000", badge: "Premium", gradient: "from-amber-500 to-orange-600" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
                  className="group relative rounded-2xl overflow-hidden bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 shadow-xl hover:shadow-2xl transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br" style={{ background: item.gradient }} opacity="5" />
                  <div className="relative p-6 h-full flex flex-col">
                    <span className="badge badge-primary mb-4 w-fit">{item.badge}</span>
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-dark-500 dark:text-dark-400 mb-4 flex-1">{item.desc}</p>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-dark-900 dark:text-white">{item.price} so'm</span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/katalog`}>Tanlash</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-dark-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="section bg-white dark:bg-dark-950" aria-labelledby="features-heading">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Nima uchun SecureCam ni tanlaysiz?
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-400">
              Biz faqat mahsulot sotamaymiz — xavfsizlik va tinchlik beramiz
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-dark-50 dark:bg-dark-900 border border-dark-100 dark:border-dark-800 hover:border-primary-200 dark:hover:border-primary-900/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-dark-600 dark:text-dark-400">{feature.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="section bg-dark-50 dark:bg-dark-900" aria-labelledby="categories-heading">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 id="categories-heading" className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Kategoriyalar bo'yicha qidiring
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-400">
              Har xil vazifalar va byudjet uchun kameralar
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.article
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={`/kategoriya/${cat.slug}`}
                  className="group block p-6 rounded-2xl bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 hover:border-primary-300 dark:hover:border-primary-900/50 hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <cat.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-semibold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mb-2">{cat.desc}</p>
                  <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">{cat.count}</span>
                </Link>
              </motion.article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link href="/katalog">Barcha kategoriyalarni ko'rish <ArrowRight className="w-5 h-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section" aria-labelledby="featured-heading">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 id="featured-heading" className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white">
                  Tavsiya etilgan mahsulotlar
                </h2>
                <p className="text-dark-600 dark:text-dark-400 mt-1">Mijozlarimiz tanlagan eng yaxshi mahsulotlar</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Button variant="ghost" asChild>
                  <Link href="/katalog?filter=featured">Barchasi <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </motion.div>
            </div>

            <div className="product-grid">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ProductCard product={product} priority={i < 4} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="section bg-dark-50 dark:bg-dark-900" aria-labelledby="new-heading">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 id="new-heading" className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white">
                  Yangi kelganlar
                </h2>
                <p className="text-dark-600 dark:text-dark-400 mt-1">Eng so'nggi texnologiyalar va modellar</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Button variant="ghost" asChild>
                  <Link href="/katalog?filter=new">Barchasi <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </motion.div>
            </div>

            <div className="product-grid">
              {newProducts.map((product, i) => (
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

      {/* CTA Section */}
      <section className="section" aria-labelledby="cta-heading">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 p-8 md:p-16 text-center"
          >
            <div className="absolute inset-0" aria-hidden="true">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-3xl mx-auto">
              <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
                Hozir buyurtma bering — erta kun yetkazib beramiz
              </h2>
              <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
                Toshkent shahrida bepul yetkazib berish. To'lov faqat mahsulot qo'lingizga yetgach. 14 kun ichida bepul qaytarish.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="xl" variant="secondary" asChild className="gap-3">
                  <Link href="/katalog">
                    Katalogdan tanlash
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 gap-3" onClick={() => window.dispatchEvent(new CustomEvent("open-order-modal"))}>
                  Tez buyurtma
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
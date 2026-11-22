"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, Search, Sun, Moon, Phone, Truck, Shield, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const navigation = [
  { name: "Bosh sahifa", href: "/" },
  { name: "Katalog", href: "/katalog" },
  { name: "Yangi kelganlar", href: "/katalog?filter=new" },
  { name: "Tavsiya etilgan", href: "/katalog?filter=featured" },
  { name: "Aloqa", href: "/aloqa" },
];

const features = [
  { icon: Truck, title: "Bepul yetkazib berish", desc: "Toshkent shahrida 1 kun, viloyatlarga 2-3 kun" },
  { icon: Shield, title: "Rasmiy kafolat", desc: "Barcha mahsulotlarga 1-3 yil kafolat" },
  { icon: HeadphonesIcon, title: "Professional yordam", desc: "O'rnatuv va sozlash bo'yicha maslahat" },
  { icon: Phone, title: "Telefon orqali buyurtma", desc: "+998 90 123 45 67 (9:00-21:00)" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDark);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-dark-950/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      )}
    >
      {/* Top Bar */}
      <div className="hidden md:flex items-center justify-between px-6 py-2 bg-primary-600 text-white text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone className="w-4 h-4" />
            <span>+998 90 123 45 67</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4" />
            <span>Toshkentda bepul yetkazib berish</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Ish vaqti: 9:00 - 21:00 (dam olishsiz)</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="relative px-4 md:px-6 py-4" aria-label="Asosiy navigatsiya">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Bosh sahifa">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 100 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.div>
            <span className="text-xl font-bold text-dark-900 dark:text-white hidden sm:block">
              SecureCam
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors relative"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-xl text-dark-500 hover:text-dark-700 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Qidiruv"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-dark-500 hover:text-dark-700 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label={isDark ? "Kun rejimi" : "Tun rejimi"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart / Order Button */}
            <Button
              variant="primary"
              size="lg"
              className="hidden sm:flex gap-2"
              onClick={() => window.dispatchEvent(new CustomEvent("open-order-modal"))}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Buyurtma berish</span>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Menyu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-dark-900 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-700">
                <span className="font-semibold text-dark-900 dark:text-white">Menyu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-dark-200 dark:border-dark-700 space-y-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-50 dark:bg-dark-800">
                      <f.icon className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white text-sm">{f.title}</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </nav>
              <div className="p-4 border-t border-dark-200 dark:border-dark-700 space-y-3">
                <Button variant="primary" className="w-full" onClick={() => window.dispatchEvent(new CustomEvent("open-order-modal"))}>
                  <ShoppingCart className="w-5 h-5" />
                  Buyurtma berish
                </Button>
                <a href="tel:+998901234567" className="block text-center py-3 px-4 rounded-xl font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                  Qo'ng'iroq qilish: +998 90 123 45 67
                </a>
              </div>
            </motion.div>
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-32 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="search"
                    placeholder="Mahsulot, brend yoki kategoriya qidiring..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                </div>
                <button onClick={() => setIsSearchOpen(false)} className="p-2 rounded-xl text-dark-400 hover:text-dark-600 hover:bg-dark-100 dark:hover:bg-dark-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["IP kameralar", "WiFi kameralar", "4G kameralar", "AHD kameralar", "O'rnatuv", "Aksessuarlar"].map((cat) => (
                  <Link
                    key={cat}
                    href={`/katalog?q=${encodeURIComponent(cat)}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-center"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
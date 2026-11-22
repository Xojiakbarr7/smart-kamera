import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Instagram, Telegram, Youtube, MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
  company: [
    { name: "Biz haqimizda", href: "/biz-haqimizda" },
    { name: "Kafolat shartlari", href: "/kafolat" },
    { name: "Yetkazib berish", href: "/yetkazib-berish" },
    { name: "Qaytarish shartlari", href: "/qaytarish" },
    { name: "Maxfiylik siyosati", href: "/maxfiylik" },
  ],
  support: [
    { name: "Tevoz yordam", href: "/yordam" },
    { name: "O'rnatuv xizmati", href: "/ornatuv" },
    { name: "Sozlash bo'yicha maslahat", href: "/sozlash" },
    { name: "Tez-tez so'raladigan savollar", href: "/faq" },
    { name: "Shikoyat va takliflar", href: "/shikoyat" },
  ],
  categories: [
    { name: "IP kameralar", href: "/kategoriya/ip-kameralar" },
    { name: "WiFi kameralar", href: "/kategoriya/wifi-kameralar" },
    { name: "4G kameralar", href: "/kategoriya/4g-kameralar" },
    { name: "AHD/TVI kameralar", href: "/kategoriya/ahd-kameralar" },
    { name: "Videoregistratorlar (NVR)", href: "/kategoriya/nvr" },
    { name: "Aksessuarlar", href: "/kategoriya/aksessuarlar" },
  ],
};

const socialLinks = [
  { icon: Telegram, href: "https://t.me/securecam_uz", label: "Telegram" },
  { icon: Instagram, href: "https://instagram.com/securecam_uz", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/securecam.uz", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com/@securecam_uz", label: "YouTube" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-950 text-dark-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative px-4 md:px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 lg:row-span-2"
            >
              <Link href="/" className="flex items-center gap-2 mb-6" aria-label="Bosh sahifa">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">SecureCam</span>
              </Link>
              <p className="text-dark-400 text-base mb-6 max-w-xs leading-relaxed">
                O'zbekistonda smart kuzatuv kameralari va xavfsizlik tizimlari yetkazib berish bo'yicha ishonchli hamkor.
                Sifat, kafolat va professional xizmat — bizning ustuvor vazifamiz.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-dark-800/50 border border-dark-700 flex items-center justify-center text-dark-400 hover:text-primary-400 hover:border-primary-500/50 hover:bg-primary-500/10 transition-all duration-300"
                    aria-label={s.label}
                  >
                    <s.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-dark-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>Toshkent, Yunusobod tumani</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-400" />
                  <a href="tel:+998901234567" className="hover:text-primary-400 transition-colors">+998 90 123 45 67</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-400" />
                  <a href="mailto:info@securecam.uz" className="hover:text-primary-400 transition-colors">info@securecam.uz</a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-400" />
                  <span>9:00 - 21:00 (dam olishsiz)</span>
                </div>
              </div>
            </motion.div>

            {/* Company */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              aria-label="Kompaniya"
            >
              <h3 className="font-semibold text-white mb-4">Kompaniya</h3>
              <ul className="space-y-3" role="list">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-dark-400 hover:text-primary-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>

            {/* Support */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              aria-label="Yordam"
            >
              <h3 className="font-semibold text-white mb-4">Yordam</h3>
              <ul className="space-y-3" role="list">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-dark-400 hover:text-primary-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>

            {/* Categories */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              aria-label="Kategoriyalar"
            >
              <h3 className="font-semibold text-white mb-4">Kategoriyalar</h3>
              <ul className="space-y-3" role="list">
                {footerLinks.categories.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-dark-400 hover:text-primary-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 md:mt-16 pt-8 border-t border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <p className="text-dark-500 text-sm">
              &copy; {currentYear} SecureCam. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex items-center gap-4 text-sm text-dark-500">
              <span>Ishlab chiqarildi</span>
              <a href="#" className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                Next.js
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <span>bilan</span>
              <a href="#" className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                Tailwind CSS
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <span>va</span>
              <a href="#" className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                Framer Motion
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
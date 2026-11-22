"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sun, Moon, Bell, Menu, User, LogOut, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

interface AdminHeaderProps {
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-dark-100 dark:border-dark-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-dark-500 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
          aria-label="Menyu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page title */}
        <div className="flex-1 lg:hidden">
          <h1 className="text-lg font-semibold text-dark-900 dark:text-white">Admin Panel</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-dark-500 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
            aria-label={theme === "dark" ? "Yorug'lik rejimi" : "Qorong'lik rejimi"}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-dark-500 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors" aria-label="Bildirishnomalar">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-dark-900 dark:text-white">{admin.name}</p>
                <p className="text-xs text-dark-500 dark:text-dark-400 capitalize">{admin.role.toLowerCase()}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-dark-500 hidden md:block" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-900 rounded-xl shadow-lg border border-dark-100 dark:border-dark-800 py-2 z-50"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-dark-100 dark:border-dark-800">
                    <p className="text-sm font-medium text-dark-900 dark:text-white">{admin.name}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">{admin.email}</p>
                  </div>
                  <a
                    href="/admin/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white"
                    role="menuitem"
                  >
                    <User className="w-4 h-4" />
                    Profil
                  </a>
                  <a
                    href="/admin/logout"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
                    Chiqish
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </header>
  );
}
"use client";

import { motion } from "framer-motion";
import { cn, formatPrice } from "@/lib/utils";
import {
  Package,
  Tag,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color: string;
  bgColor: string;
  delay: number;
}

function StatCard({ title, value, icon, trend, color, bgColor, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-500 dark:text-dark-400">{title}</p>
          <p className="text-3xl font-bold text-dark-900 dark:text-white mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.value >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.value >= 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bgColor)}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface AdminStatsProps {
  stats: {
    totalProducts: number;
    totalCategories: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number | string;
  };
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Mahsulotlar"
        value={stats.totalProducts}
        icon={<Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        color="text-blue-600"
        bgColor="bg-blue-100 dark:bg-blue-900/30"
        delay={0}
      />
      <StatCard
        title="Kategoriyalar"
        value={stats.totalCategories}
        icon={<Tag className="w-6 h-6 text-green-600 dark:text-green-400" />}
        color="text-green-600"
        bgColor="bg-green-100 dark:bg-green-900/30"
        delay={0.1}
      />
      <StatCard
        title="Buyurtmalar"
        value={stats.totalOrders}
        icon={<ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
        color="text-purple-600"
        bgColor="bg-purple-100 dark:bg-purple-900/30"
        delay={0.2}
      />
      <StatCard
        title="Daromad"
        value={formatPrice(stats.totalRevenue)}
        icon={<DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
        color="text-amber-600"
        bgColor="bg-amber-100 dark:bg-amber-900/30"
        delay={0.3}
      />
    </div>
  );
}
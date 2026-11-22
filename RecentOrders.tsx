"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Eye, Truck, CheckCircle, XCircle, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";
  customerName: string;
  customerPhone: string;
  totalAmount: number | string;
  itemsCount: number;
  createdAt: string;
}

interface RecentOrdersProps {
  initialOrders?: Order[];
}

const statusConfig = {
  PENDING: { label: "Yangi", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  CONFIRMED: { label: "Tasdiqlangan", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle },
  SHIPPING: { label: "Yetkazilmoqda", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck },
  DELIVERED: { label: "Bajarildi", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  CANCELLED: { label: "Bekor qilingan", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

export function RecentOrders({ initialOrders = [] }: RecentOrdersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white">So'nggi buyurtmalar</h2>
        <Button variant="ghost" asChild size="sm">
          <Link href="/admin/orders">Barchasi ko'rish</Link>
        </Button>
      </div>

      {initialOrders.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-1">Buyurtmalar yo'q</h3>
          <p className="text-dark-500 dark:text-dark-400">Hozircha yangi buyurtmalar kelmagan</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="bg-dark-50 dark:bg-dark-800/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Buyurtma</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Mijoz</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Mahsulotlar</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Summa</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Holat</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Sana</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
              {initialOrders.map((order, index) => {
                const config = statusConfig[order.status];
                const Icon = config.icon;
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white">{order.customerName}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                        <Package className="w-3 h-3" />
                        {order.itemsCount} ta
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-dark-900 dark:text-white">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.color)}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-500 dark:text-dark-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("uz-UZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`} className="gap-1">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Ko'rish</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <MoreHorizontal className="w-4 h-4" />
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
    </motion.div>
  );
}
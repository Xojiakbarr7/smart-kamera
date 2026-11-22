import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminStats } from "./AdminStats";
import { RecentOrders } from "./RecentOrders";

export const metadata: Metadata = {
  title: "Boshqaruv paneli — SecureCam Admin",
};

async function getStats() {
  const [totalProducts, totalCategories, totalOrders, pendingOrders, totalRevenue] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { in: ["CONFIRMED", "SHIPPING", "DELIVERED"] } },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Boshqaruv paneli</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Ma'lumotlar tahlili va tezkor harakatlar</p>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStats stats={stats} />

      {/* Recent Orders */}
      <RecentOrders />
    </div>
  );
}
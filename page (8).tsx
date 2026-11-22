import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminOrdersClient } from "./AdminOrdersClient";

export const metadata: Metadata = {
  title: "Buyurtmalar — SecureCam Admin",
};

async function getOrders() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { product: { select: { name: true, images: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return orders;
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return <AdminOrdersClient initialOrders={orders} />;
}
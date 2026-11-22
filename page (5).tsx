import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminCategoriesClient } from "./AdminCategoriesClient";

export const metadata: Metadata = {
  title: "Kategoriyalar — SecureCam Admin",
};

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { order: "asc" },
  });
  return categories;
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <AdminCategoriesClient initialCategories={categories} />;
}
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminProductsClient } from "./AdminProductsClient";

export const metadata: Metadata = {
  title: "Mahsulotlar — SecureCam Admin",
};

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true, brand: true },
    orderBy: { order: "asc" },
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return { products, categories, brands };
}

export default async function AdminProductsPage() {
  const { products, categories, brands } = await getProducts();

  return <AdminProductsClient initialProducts={products} categories={categories} brands={brands} />;
}
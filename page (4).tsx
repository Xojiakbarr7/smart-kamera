import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminBrandsClient } from "./AdminBrandsClient";

export const metadata: Metadata = {
  title: "Brendlar — SecureCam Admin",
};

async function getBrands() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return brands;
}

export default async function AdminBrandsPage() {
  const brands = await getBrands();
  return <AdminBrandsClient initialBrands={brands} />;
}
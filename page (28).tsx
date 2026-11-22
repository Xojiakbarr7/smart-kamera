import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true, brand: true },
  });

  if (!product) {
    return { title: "Mahsulot topilmadi" };
  }

  return {
    title: product.name,
    description: product.shortDesc || product.description || `${product.name} — Smart kuzatuv kamerasi. Rasmiy kafolat, bepul yetkazib berish.`,
    openGraph: {
      title: product.name,
      description: product.shortDesc || product.description || "",
      images: product.images[0] || "/og-image.jpg",
      type: "product",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDesc || product.description || "",
      images: product.images[0] || "/og-image.jpg",
    },
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "UZS",
      "product:brand": product.brand?.name || "SecureCam",
      "product:category": product.category.name,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true, brand: true },
  });

  if (!product) {
    notFound();
  }

  // Get related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { order: "asc" },
    include: { category: true, brand: true },
  });

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
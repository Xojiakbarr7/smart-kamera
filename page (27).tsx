import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CatalogClient } from "./CatalogClient";

export const metadata: Metadata = {
  title: "Katalog — Smart kuzatuv kameralari",
  description: "IP, WiFi, 4G, AHD kameralar va NVR videoregistratorlar katalogi. Filtrlash, saralash va qidiruv imkoniyati bilan.",
};

interface CatalogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const page = parseInt((params.page as string) || "1");
  const limit = 12;
  const category = params.category as string;
  const brand = params.brand as string;
  const filter = params.filter as string;
  const search = params.q as string;
  const sort = params.sort as string || "newest";
  const minPrice = params.minPrice ? parseInt(params.minPrice as string) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice as string) : undefined;

  // Build where clause
  const where: any = { isActive: true };

  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };
  if (filter === "featured") where.isFeatured = true;
  if (filter === "new") where.isNew = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { shortDesc: { contains: search, mode: "insensitive" } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  // Sorting
  const orderBy: any = {};
  switch (sort) {
    case "price_asc": orderBy.price = "asc"; break;
    case "price_desc": orderBy.price = "desc"; break;
    case "popular": orderBy.order = "asc"; break;
    case "newest":
    default: orderBy.createdAt = "desc"; break;
  }

  const [products, total, categories, brands, priceRange] = await Promise.all([
    prisma.product.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy,
      include: { category: true, brand: true },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    }),
    prisma.product.aggregate({
      where: { isActive: true },
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <CatalogClient
      initialProducts={products}
      initialTotal={total}
      initialPage={page}
      totalPages={totalPages}
      categories={categories}
      brands={brands}
      priceRange={{ min: Number(priceRange._min.price || 0), max: Number(priceRange._max.price || 10000000) }}
      currentFilters={{ category, brand, filter, search, sort, minPrice, maxPrice }}
    />
  );
}
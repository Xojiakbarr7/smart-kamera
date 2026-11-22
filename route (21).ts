import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0),
  oldPrice: z.number().optional().nullable(),
  sku: z.string().min(2),
  stock: z.number().min(0),
  categoryId: z.string().min(1),
  brandId: z.string().optional().nullable(),
  images: z.array(z.string()).min(1),
  features: z.record(z.string()).optional(),
  specifications: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  order: z.number().default(0),
});

async function getAdminId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token;
}

export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true, brand: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    // Check if slug exists
    const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "Bu slug allaqachon mavjud" }, { status: 400 });
    }

    // Check if SKU exists
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      return NextResponse.json({ error: "Bu SKU allaqachon mavjud" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        price: data.price,
        oldPrice: data.oldPrice,
        features: data.features || {},
        specifications: data.specifications || {},
      },
      include: { category: true, brand: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
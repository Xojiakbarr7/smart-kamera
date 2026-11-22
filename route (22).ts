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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, brand: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    // Check if slug exists for another product
    const existingSlug = await prisma.product.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (existingSlug) {
      return NextResponse.json({ error: "Bu slug allaqachon mavjud" }, { status: 400 });
    }

    // Check if SKU exists for another product
    const existingSku = await prisma.product.findFirst({
      where: { sku: data.sku, NOT: { id } },
    });
    if (existingSku) {
      return NextResponse.json({ error: "Bu SKU allaqachon mavjud" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price,
        oldPrice: data.oldPrice,
        features: data.features || {},
        specifications: data.specifications || {},
      },
      include: { category: true, brand: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if product has order items
    const orderItems = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItems > 0) {
      // Soft delete - just mark as inactive
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, message: "Mahsulot nofaol qilindi (buyurtmalar mavjud)" });
    }

    // Hard delete if no orders
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
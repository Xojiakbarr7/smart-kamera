import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
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

  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(brands);
}

export async function POST(request: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = brandSchema.parse(body);

    const existingSlug = await prisma.brand.findUnique({ where: { slug: data.slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "Bu slug allaqachon mavjud" }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data,
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Create brand error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
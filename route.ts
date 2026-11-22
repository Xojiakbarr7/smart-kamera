import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";

const adminSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 belgi"),
  email: z.string().email("Noto'g'ri email"),
  password: z.string().min(6, "Parol kamida 6 belgi"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER"]).default("ADMIN"),
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

  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(admins);
}

export async function POST(request: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = adminSchema.parse(body);

    const existingEmail = await prisma.adminUser.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Bu email allaqachon ro'yxatdan o'tgan" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const admin = await prisma.adminUser.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Create admin error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
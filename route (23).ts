import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const siteSettingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteDescription: z.string().optional(),
  siteLogo: z.string().url().optional().or(z.literal("")),
  siteFavicon: z.string().url().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactAddress: z.string().optional(),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  telegramEnabled: z.boolean().optional(),
  freeDelivery: z.boolean().optional(),
  minOrderForFreeDelivery: z.number().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
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

  let settings = await prisma.siteSettings.findFirst();

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        siteName: "SecureCam",
        siteDescription: "Aqlli kuzatuv kameralari do'koni",
        currency: "UZS",
        timezone: "Asia/Tashkent",
        freeDelivery: true,
      },
    });
  }

  // Don't expose sensitive data
  const { telegramBotToken, ...safeSettings } = settings;

  return NextResponse.json(safeSettings);
}

export async function PUT(request: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = siteSettingsSchema.parse(body);

    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({ data });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    const { telegramBotToken, ...safeSettings } = settings;
    return NextResponse.json(safeSettings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
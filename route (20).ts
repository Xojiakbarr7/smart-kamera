import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"]),
});

const cancelSchema = z.object({
  reason: z.string().min(5, "Sabab kamida 5 belgi bo'lishi kerak"),
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

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { name: true, images: true, slug: true } } },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
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

    // Check if it's a status update or cancel request
    if ("status" in body && !("reason" in body)) {
      const { status } = statusSchema.parse(body);

      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) {
        return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
      }

      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["SHIPPING", "CANCELLED"],
        SHIPPING: ["DELIVERED", "CANCELLED"],
        DELIVERED: [],
        CANCELLED: [],
      };

      if (!validTransitions[order.status]?.includes(status)) {
        return NextResponse.json({ error: "Noto'g'ri status o'tishi" }, { status: 400 });
      }

      const data: Record<string, unknown> = { status };
      if (status === "DELIVERED") data.deliveredAt = new Date();
      if (status === "CANCELLED") data.cancelledAt = new Date();

      const updatedOrder = await prisma.order.update({
        where: { id },
        data,
        include: {
          items: {
            include: { product: { select: { name: true, images: true } } },
          },
        },
      });

      return NextResponse.json(updatedOrder);
    }

    if ("reason" in body) {
      const { reason } = cancelSchema.parse(body);

      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) {
        return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
      }

      if (order.status === "DELIVERED" || order.status === "CANCELLED") {
        return NextResponse.json({ error: "Bu buyurtmani bekor qilib bo'lmaydi" }, { status: 400 });
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelReason: reason,
          cancelledAt: new Date(),
        },
        include: {
          items: {
            include: { product: { select: { name: true, images: true } } },
          },
        },
      });

      // Restore stock for cancelled order items
      await prisma.$transaction(
        updatedOrder.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );

      return NextResponse.json(updatedOrder);
    }

    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
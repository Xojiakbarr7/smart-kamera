import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, address, comment, productId, quantity } = body;

    // Validation
    if (!name || !phone || !address || !productId || !quantity) {
      return NextResponse.json(
        { message: "Barcha majburiy maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Mahsulot topilmadi" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { message: "Yetarli mahsulot omborda yo'q" },
        { status: 400 }
      );
    }

    const price = Number(product.price);
    const totalAmount = price * quantity;
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: name,
        customerPhone: phone,
        customerEmail: email || null,
        address,
        comment: comment || null,
        totalAmount,
        itemsCount: quantity,
        status: "PENDING",
        items: {
          create: {
            quantity,
            price,
            total: totalAmount,
            productId,
          },
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Send Telegram notification
    await sendTelegramNotification(order);

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      message: "Buyurtma muvaffaqiyatli qabul qilindi",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { message: "Server xatosi, qayta urinib ko'ring" },
      { status: 500 }
    );
  }
}

async function sendTelegramNotification(order: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram config not set");
    return;
  }

  const statusEmoji = {
    PENDING: "🆕",
    CONFIRMED: "✅",
    SHIPPING: "🚚",
    DELIVERED: "🎉",
    CANCELLED: "❌",
  };

  const itemsText = order.items
    .map((item: any) => `• ${item.product.name} × ${item.quantity} = ${item.total.toLocaleString("uz-UZ")} so'm`)
    .join("\n");

  const message = `
${statusEmoji.PENDING} <b>YANGI BUYURTMA</b>

<b>Buyurtma raqami:</b> ${order.orderNumber}
<b>Sana:</b> ${new Date(order.createdAt).toLocaleString("uz-UZ")}

<b>Mijoz:</b> ${order.customerName}
<b>Telefon:</b> ${order.customerPhone}
${order.customerEmail ? `<b>Email:</b> ${order.customerEmail}` : ""}
<b>Manzil:</b> ${order.address}
${order.comment ? `<b>Izoh:</b> ${order.comment}` : ""}

<b>Mahsulotlar:</b>
${itemsText}

<b>Jami: ${order.totalAmount.toLocaleString("uz-UZ")} so'm</b>
<b>Yetkazib berish: Bepul</b>
<b>To'lov: Naqd/Karta (taqdim etilganda)</b>
  `.trim();

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Tasdiqlash", callback_data: `order_confirm_${order.id}` },
              { text: "🚚 Yetkazish", callback_data: `order_ship_${order.id}` },
            ],
            [
              { text: "🎉 Bajarildi", callback_data: `order_deliver_${order.id}` },
              { text: "❌ Bekor qilish", callback_data: `order_cancel_${order.id}` },
            ],
          ],
        },
      }),
    });
  } catch (error) {
    console.error("Telegram notification error:", error);
  }
}
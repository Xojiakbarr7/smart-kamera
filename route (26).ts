import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ ok: false, error: "Bot token not configured" }, { status: 500 });
    }

    const update = await request.json();

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query, botToken);
    }

    // Handle messages (commands)
    if (update.message) {
      await handleMessage(update.message, botToken);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function handleCallbackQuery(callbackQuery: any, botToken: string) {
  const { id, data, message, from } = callbackQuery;
  const chatId = message.chat.id;

  // Answer callback query to remove loading state
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: id }),
  });

  if (!data?.startsWith("order_")) return;

  const [, action, orderId] = data.split("_");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    await editMessage(botToken, chatId, message.message_id, "❌ Buyurtma topilmadi");
    return;
  }

  let newStatus: string;
  let statusText: string;
  let emoji: string;

  switch (action) {
    case "confirm":
      newStatus = "CONFIRMED";
      statusText = "Tasdiqlangan";
      emoji = "✅";
      break;
    case "ship":
      newStatus = "SHIPPING";
      statusText = "Yetkazilmoqda";
      emoji = "🚚";
      break;
    case "deliver":
      newStatus = "DELIVERED";
      statusText = "Bajarildi";
      emoji = "🎉";
      break;
    case "cancel":
      newStatus = "CANCELLED";
      statusText = "Bekor qilingan";
      emoji = "❌";
      break;
    default:
      return;
  }

  // Update order
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus as any,
      ...(newStatus === "DELIVERED" && { deliveredAt: new Date() }),
      ...(newStatus === "CANCELLED" && { cancelledAt: new Date() }),
    },
  });

  // Update message with new status
  const itemsText = order.items
    .map((item) => `• ${item.product.name} × ${item.quantity} = ${item.total.toLocaleString("uz-UZ")} so'm`)
    .join("\n");

  const updatedMessage = `
${emoji} <b>BUYURTMA HOLATI YANGILANDI</b>

<b>Buyurtma raqami:</b> ${order.orderNumber}
<b>Yangi holat:</b> ${statusText}

<b>Mijoz:</b> ${order.customerName}
<b>Telefon:</b> ${order.customerPhone}
<b>Manzil:</b> ${order.address}

<b>Mahsulotlar:</b>
${itemsText}

<b>Jami: ${order.totalAmount.toLocaleString("uz-UZ")} so'm</b>
  `.trim();

  await editMessage(botToken, chatId, message.message_id, updatedMessage, getOrderKeyboard(orderId, newStatus));

  // Notify customer if phone number exists (would need Telegram user mapping)
  // This is optional - you could store customer's Telegram ID in the order
}

function getOrderKeyboard(orderId: string, currentStatus: string) {
  const buttons = [];

  if (currentStatus === "PENDING") {
    buttons.push([{ text: "✅ Tasdiqlash", callback_data: `order_confirm_${orderId}` }]);
  }
  if (currentStatus === "CONFIRMED") {
    buttons.push([{ text: "🚚 Yetkazish", callback_data: `order_ship_${orderId}` }]);
  }
  if (currentStatus === "SHIPPING") {
    buttons.push([{ text: "🎉 Bajarildi", callback_data: `order_deliver_${orderId}` }]);
  }
  if (!["DELIVERED", "CANCELLED"].includes(currentStatus)) {
    buttons.push([{ text: "❌ Bekor qilish", callback_data: `order_cancel_${orderId}` }]);
  }

  return { inline_keyboard: buttons };
}

async function editMessage(botToken: string, chatId: number, messageId: number, text: string, replyMarkup?: any) {
  await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });
}

async function handleMessage(message: any, botToken: string) {
  const { text, chat, from } = message;
  const chatId = chat.id;

  if (text === "/start") {
    await sendMessage(botToken, chatId, `
🤖 <b>SecureCam Buyurtma Boti</b>

Bu bot yangi buyurtmalar haqida xabar beradi va ularni boshqarish imkonini beradi.

<b>Buyruqlar:</b>
/start - Botni ishga tushirish
/help - Yordam
/orders - So'nggi buyurtmalar
/stats - Statistika
    `.trim());
  } else if (text === "/help") {
    await sendMessage(botToken, chatId, `
📋 <b>Yordam</b>

Bot avtomatik ravishda yangi buyurtmalarni yuboradi.
Buyurtma holatini o'zgartirish uchun xabardagi tugmalardan foydalaning.

Admin panel: <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">securecam.uz/admin</a>
    `.trim());
  } else if (text === "/orders") {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    });

    if (orders.length === 0) {
      await sendMessage(botToken, chatId, "📭 Buyurtmalar yo'q");
      return;
    }

    const ordersText = orders
      .map((o) => {
        const statusEmoji = {
          PENDING: "🆕",
          CONFIRMED: "✅",
          SHIPPING: "🚚",
          DELIVERED: "🎉",
          CANCELLED: "❌",
        }[o.status] || "❓";

        return `${statusEmoji} <b>${o.orderNumber}</b> — ${o.customerName} (${o.customerPhone})\n${o.items.map(i => `  • ${i.product.name} × ${i.quantity}`).join("\n")}\n<b>Jami:</b> ${o.totalAmount.toLocaleString("uz-UZ")} so'm`;
      })
      .join("\n\n");

    await sendMessage(botToken, chatId, `📦 <b>So'nggi 10 buyurtma:</b>\n\n${ordersText}`);
  } else if (text === "/stats") {
    const [total, pending, confirmed, shipping, delivered, cancelled] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.order.count({ where: { status: "SHIPPING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
    ]);

    const revenue = await prisma.order.aggregate({
      where: { status: { in: ["DELIVERED", "SHIPPING", "CONFIRMED"] } },
      _sum: { totalAmount: true },
    });

    await sendMessage(botToken, chatId, `
📊 <b>Statistika</b>

📦 Jami buyurtmalar: <b>${total}</b>
🆕 Yangi: <b>${pending}</b>
✅ Tasdiqlangan: <b>${confirmed}</b>
🚚 Yetkazilmoqda: <b>${shipping}</b>
🎉 Bajarildi: <b>${delivered}</b>
❌ Bekor qilingan: <b>${cancelled}</b>

💰 Daromad (tasdiqlangan+): <b>${(revenue._sum.totalAmount || 0).toLocaleString("uz-UZ")} so'm</b>
    `.trim());
  }
}

async function sendMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
}
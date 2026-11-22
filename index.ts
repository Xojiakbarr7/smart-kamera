import { Telegraf, Markup, Scenes, session } from "telegraf";
import { prisma } from "@/lib/prisma";

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!botToken) {
  console.warn("⚠️ TELEGRAM_BOT_TOKEN not set. Bot will not start.");
  process.exit(0);
}

const bot = new Telegraf(botToken);

// Admin scene for order management
const orderScene = new Scenes.BaseScene("order_scene");

orderScene.enter(async (ctx) => {
  const orderId = ctx.session.orderId;
  if (!orderId) return ctx.scene.leave();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    await ctx.reply("Buyurtma topilmadi.");
    return ctx.scene.leave();
  }

  const message = formatOrderMessage(order);
  const keyboard = getOrderKeyboard(order);

  await ctx.reply(message, { parse_mode: "HTML", ...keyboard });
});

orderScene.action(/^order_(confirm|ship|deliver|cancel)_(.+)$/, async (ctx) => {
  const [, action, orderId] = ctx.match;
  const adminId = ctx.from.id.toString();

  try {
    let newStatus: "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";
    switch (action) {
      case "confirm": newStatus = "CONFIRMED"; break;
      case "ship": newStatus = "SHIPPING"; break;
      case "deliver": newStatus = "DELIVERED"; break;
      case "cancel": newStatus = "CANCELLED"; break;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      await ctx.answerCbQuery("Buyurtma topilmadi");
      return;
    }

    // Validate transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["DELIVERED", "CANCELLED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      await ctx.answerCbQuery("Noto'g'ri status o'tishi");
      return;
    }

    const data: Record<string, unknown> = { status: newStatus };
    if (newStatus === "DELIVERED") data.deliveredAt = new Date();
    if (newStatus === "CANCELLED") data.cancelledAt = new Date();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data,
      include: { items: { include: { product: true } } },
    });

    // If cancelled, restore stock
    if (newStatus === "CANCELLED") {
      await prisma.$transaction(
        updatedOrder.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );
    }

    const message = formatOrderMessage(updatedOrder);
    const keyboard = getOrderKeyboard(updatedOrder);

    await ctx.editMessageText(message, { parse_mode: "HTML", ...keyboard });
    await ctx.answerCbQuery(`Status o'zgartirildi: ${getStatusLabel(newStatus)}`);
  } catch (error) {
    console.error("Order action error:", error);
    await ctx.answerCbQuery("Xatolik yuz berdi");
  }
});

orderScene.action(/^order_back$/, async (ctx) => {
  await ctx.scene.leave();
});

const stage = new Scenes.Stage([orderScene]);
bot.use(session());
bot.use(stage.middleware());

// Commands
bot.command("start", async (ctx) => {
  const isAdmin = chatId && ctx.chat.id.toString() === chatId;
  if (isAdmin) {
    await ctx.reply(
      "🤖 SecureCam Admin Bot\n\nBuyurtmalar Telegram orqali boshqarish uchun tayyor.",
      Markup.inlineKeyboard([Markup.button.callback("📋 Buyurtmalar ro'yxati", "list_orders")])
    );
  } else {
    await ctx.reply("Salom! Bu SecureCam admin botidir. Faqat adminlar uchun mo'ljallangan.");
  }
});

bot.command("orders", async (ctx) => {
  if (chatId && ctx.chat.id.toString() !== chatId) {
    await ctx.reply("Ruxsat yo'q.");
    return;
  }

  const orders = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED", "SHIPPING"] } },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (orders.length === 0) {
    await ctx.reply("Hozircha faol buyurtmalar yo'q.");
    return;
  }

  for (const order of orders) {
    const message = formatOrderMessage(order);
    const keyboard = getOrderKeyboard(order);
    await ctx.reply(message, { parse_mode: "HTML", ...keyboard });
  }
});

bot.action("list_orders", async (ctx) => {
  if (chatId && ctx.chat.id.toString() !== chatId) {
    await ctx.answerCbQuery("Ruxsat yo'q");
    return;
  }

  await ctx.answerCbQuery();
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED", "SHIPPING"] } },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (orders.length === 0) {
    await ctx.reply("Hozircha faol buyurtmalar yo'q.");
    return;
  }

  for (const order of orders) {
    const message = formatOrderMessage(order);
    const keyboard = getOrderKeyboard(order);
    await ctx.reply(message, { parse_mode: "HTML", ...keyboard });
  }
});

// Helper functions
function formatOrderMessage(order: {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  comment: string | null;
  totalAmount: number | string;
  items: { quantity: number; price: number | string; product: { name: string } }[];
  createdAt: Date;
}) {
  const statusLabels: Record<string, string> = {
    PENDING: "🟡 Yangi",
    CONFIRMED: "🔵 Tasdiqlangan",
    SHIPPING: "🟣 Yetkazilmoqda",
    DELIVERED: "🟢 Bajarildi",
    CANCELLED: "🔴 Bekor qilingan",
  };

  const itemsText = order.items
    .map((item) => `• ${item.product.name} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`)
    .join("\n");

  return (
    `<b>📦 Buyurtma: ${order.orderNumber}</b>\n` +
    `<b>Status:</b> ${statusLabels[order.status]}\n` +
    `<b>Mijoz:</b> ${order.customerName}\n` +
    `<b>Telefon:</b> <code>${order.customerPhone}</code>\n` +
    (order.customerEmail ? `<b>Email:</b> ${order.customerEmail}\n` : "") +
    `<b>Manzil:</b> ${order.address}\n` +
    (order.comment ? `<b>Izoh:</b> ${order.comment}\n` : "") +
    `\n<b>Mahsulotlar:</b>\n${itemsText}\n` +
    `\n<b>Jami: ${formatPrice(order.totalAmount)}</b>\n` +
    `<b>Sana:</b> ${formatDate(order.createdAt)}`
  );
}

function getOrderKeyboard(order: { id: string; status: string }) {
  const buttons = [];

  if (order.status === "PENDING") {
    buttons.push([Markup.button.callback("✅ Tasdiqlash", `order_confirm_${order.id}`)]);
    buttons.push([Markup.button.callback("❌ Bekor qilish", `order_cancel_${order.id}`)]);
  } else if (order.status === "CONFIRMED") {
    buttons.push([Markup.button.callback("🚚 Yetkazish", `order_ship_${order.id}`)]);
    buttons.push([Markup.button.callback("❌ Bekor qilish", `order_cancel_${order.id}`)]);
  } else if (order.status === "SHIPPING") {
    buttons.push([Markup.button.callback("✅ Bajarildi", `order_deliver_${order.id}`)]);
    buttons.push([Markup.button.callback("❌ Bekor qilish", `order_cancel_${order.id}`)]);
  }

  return Markup.inlineKeyboard(buttons);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    CONFIRMED: "Tasdiqlangan",
    SHIPPING: "Yetkazilmoqda",
    DELIVERED: "Bajarildi",
    CANCELLED: "Bekor qilingan",
  };
  return labels[status] || status;
}

function formatPrice(amount: number | string): string {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Export bot instance for webhook
export { bot };

// Start bot if run directly
if (require.main === module) {
  bot.launch().then(() => {
    console.log("🤖 Telegram bot started");
  });

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
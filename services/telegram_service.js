const TELEGRAM_API = "https://api.telegram.org";

function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("Telegram server credentials are not configured");
  return { token, chatId };
}

export async function sendOrderToTelegram(order) {
  const { token, chatId } = getTelegramConfig();

  const customerName = order.customerName || order.customer_name || (order.googleEmail ? `حساب: ${order.googleEmail}` : "عميل من الموقع");
  const contactMethod = (order.contactMethod || order.contact_method || "whatsapp").toLowerCase();
  const contactValue = order.contactValue || order.contact_value || order.googleEmail || "غير محدد";
  const serviceTitle = order.serviceTitle || order.service_title || "خدمة من المنصة";
  const targetDetails = order.targetUrlOrDetails || order.target_url_or_details || order.targetAccount || order.target_account || "لم يتم إرفاق رابط";
  const notes = order.notes ? `\n📝 ملاحظات الزبون: ${order.notes}` : "";

  let paymentText = "";
  if (order.paymentMethod === "points" || (!order.paymentMethod && order.pointsPrice)) {
    paymentText = `رصيد نقاط تيك محلي (${order.pointsPrice ?? 0} نقطة)`;
  } else if (order.paymentMethod === "crypto" || order.paymentMethod === "usdt") {
    paymentText = `عملات رقمية OKX (USDT TRC20) - $${order.usdPrice ?? "0"}`;
  } else if (order.paymentMethod === "payoneer") {
    paymentText = `Payoneer مباشر - $${order.usdPrice ?? "0"}`;
  } else {
    paymentText = `$${order.usdPrice ?? "0.00"} / ${order.pointsPrice ?? 0} نقطة`;
  }

  // Method metadata mapping
  const methodMap = {
    whatsapp: {
      name: "واتساب (WhatsApp)",
      icon: "🟢",
      getLink: (val) => {
        const cleaned = val.replace(/[^0-9]/g, "");
        return cleaned ? `https://wa.me/${cleaned}` : null;
      },
    },
    instagram: {
      name: "انستقرام (Instagram)",
      icon: "🟣",
      getLink: (val) => {
        const cleaned = val.replace(/^@/, "").trim();
        return cleaned ? `https://instagram.com/${cleaned}` : null;
      },
    },
    tiktok: {
      name: "تيك توك (TikTok)",
      icon: "⚫",
      getLink: (val) => {
        const cleaned = val.replace(/^@/, "").trim();
        return cleaned ? `https://tiktok.com/@${cleaned}` : null;
      },
    },
    telegram: {
      name: "تيليجرام (Telegram)",
      icon: "🔵",
      getLink: (val) => {
        if (val.startsWith("+") || /^[0-9]+$/.test(val.replace(/[\s-]/g, ""))) {
          return `https://t.me/+${val.replace(/[^0-9]/g, "")}`;
        }
        const cleaned = val.replace(/^@/, "").trim();
        return cleaned ? `https://t.me/${cleaned}` : null;
      },
    },
    facebook: {
      name: "فيسبوك (Facebook)",
      icon: "🔷",
      getLink: (val) => (val.startsWith("http") ? val : `https://facebook.com/${val.trim()}`),
    },
    phone: {
      name: "اتصال هاتفي مباشر",
      icon: "📞",
      getLink: (val) => `tel:${val.trim()}`,
    },
    email: {
      name: "بريد إلكتروني",
      icon: "✉️",
      getLink: (val) => `mailto:${val.trim()}`,
    },
  };

  const methodMeta = methodMap[contactMethod] || {
    name: contactMethod,
    icon: "📱",
    getLink: () => null,
  };

  const directLink = methodMeta.getLink ? methodMeta.getLink(contactValue) : null;
  const orderId = order.id || order.orderId || `ORD-${Date.now().toString(36).toUpperCase()}`;

  const dateStr = new Date().toLocaleString("ar-YE", {
    timeZone: "Asia/Aden",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines = [
    "🛒 طلب جديد وصل من الموقع! 🚀",
    "━━━━━━━━━━━━━━━━━━━━",
    `📌 الخدمة المطلوبة:`,
    `   ${serviceTitle}`,
    "",
    `👤 اسم الزبون:`,
    `   ${customerName}`,
    "",
    `${methodMeta.icon} وسيلة التواصل للتسليم والمتابعة:`,
    `   • النوع: ${methodMeta.name}`,
    `   • الحساب / الرقم: ${contactValue}`,
  ];

  if (directLink) {
    lines.push(`   • رابط المراسلة السريع: ${directLink}`);
  }

  lines.push(
    "",
    `🎯 رابط الحساب / تفاصيل تنفيذ الطلب:`,
    `   ${targetDetails}`,
    "",
    `💰 طريقة الدفع:`,
    `   ${paymentText}`
  );

  if (order.remainingPoints !== undefined && order.remainingPoints !== null) {
    lines.push(`🪙 رصيد الزبون المتبقي: ${order.remainingPoints} نقطة`);
  }

  if (notes) {
    lines.push(notes);
  }

  lines.push(
    "",
    `🆔 رقم الطلب: #${orderId}`,
    `⏰ الوقت: ${dateStr}`,
    "━━━━━━━━━━━━━━━━━━━━",
    "✅ يمكنك الآن التواصل مع الزبون وإرسال طلبه له بعد الانتهاء من الإنجاز."
  );

  const text = lines.join("\n");

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: false }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok !== true) {
    throw new Error(`Telegram sendMessage failed (${response.status}): ${payload.description || "unknown error"}`);
  }
  return payload.result;
}

export async function verifyTelegramBotToken() {
  const { token } = getTelegramConfig();
  const response = await fetch(`${TELEGRAM_API}/bot${token}/getMe`);
  const payload = await response.json();
  return response.ok && payload.ok === true;
}

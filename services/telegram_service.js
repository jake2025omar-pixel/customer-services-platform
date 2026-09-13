const TELEGRAM_API = "https://api.telegram.org";

function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("Telegram server credentials are not configured");
  return { token, chatId };
}

export async function sendOrderToTelegram(order) {
  const { token, chatId } = getTelegramConfig();
  const text = [
    "🛒 طلب جديد",
    `الخدمة: ${String(order.serviceTitle)}`,
    `العميل: ${String(order.googleEmail)}`,
    `السعر: $${order.usdPrice ?? "0.00"} / ${order.pointsPrice ?? 0} نقطة`,
    `رقم الطلب: ${String(order.id)}`,
  ].join("\n");

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok !== true) {
    throw new Error(`Telegram sendMessage failed (${response.status})`);
  }
  return payload.result;
}

export async function verifyTelegramBotToken() {
  const { token } = getTelegramConfig();
  const response = await fetch(`${TELEGRAM_API}/bot${token}/getMe`);
  const payload = await response.json();
  return response.ok && payload.ok === true;
}

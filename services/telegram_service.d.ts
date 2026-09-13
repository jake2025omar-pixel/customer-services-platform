export type TelegramOrder = {
  id: string;
  serviceTitle: string;
  googleEmail: string;
  usdPrice: string | number | null;
  pointsPrice: number | null;
};

export function sendOrderToTelegram(order: TelegramOrder): Promise<unknown>;
export function verifyTelegramBotToken(): Promise<boolean>;

export type TelegramOrder = {
  id?: string;
  orderId?: string;
  serviceTitle: string;
  serviceId?: string;
  customerName?: string;
  customer_name?: string;
  contactMethod?: string;
  contact_method?: string;
  contactValue?: string;
  contact_value?: string;
  targetUrlOrDetails?: string;
  target_url_or_details?: string;
  targetAccount?: string;
  target_account?: string;
  notes?: string;
  paymentMethod?: string;
  googleEmail?: string | null;
  usdPrice?: string | number | null;
  pointsPrice?: number | null;
  remainingPoints?: number | null;
};

export function sendOrderToTelegram(order: TelegramOrder): Promise<unknown>;
export function verifyTelegramBotToken(): Promise<boolean>;

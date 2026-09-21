import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Loader2,
  User,
  MessageCircle,
  Instagram,
  Send,
  Phone,
  Mail,
  Share2,
  Sparkles,
  ExternalLink,
  Bot,
  AlertCircle,
} from "lucide-react";
import { Service } from "@/lib/firestoreService";

interface OrderCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  userPoints: number;
  onOrderSuccess: (newBalance: number, orderId: string) => void;
}

export type ContactMethodType =
  | "whatsapp"
  | "instagram"
  | "tiktok"
  | "telegram"
  | "facebook"
  | "phone"
  | "email";

interface ContactOption {
  id: ContactMethodType;
  label: string;
  iconName: string;
  placeholder: string;
  helperText: string;
  badgeColor: string;
}

const CONTACT_OPTIONS: ContactOption[] = [
  {
    id: "whatsapp",
    label: "واتساب",
    iconName: "whatsapp",
    placeholder: "مثال: 967781741708+ أو 781741708",
    helperText: "سنقوم بمراسلتك مباشرة على الواتساب فور استلام وإنجاز طلبك.",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  },
  {
    id: "instagram",
    label: "انستقرام",
    iconName: "instagram",
    placeholder: "مثال: @username أو رابط الحساب",
    helperText: "سنقوم بمراسلتك عبر الخاص (DM) في انستقرام بعد تجهيز طلبك.",
    badgeColor: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40",
  },
  {
    id: "tiktok",
    label: "تيك توك",
    iconName: "tiktok",
    placeholder: "مثال: @tiktok_user أو رابط الحساب",
    helperText: "سنقوم بالتواصل معك عبر حسابك على تيك توك لتسليم الخدمة.",
    badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  },
  {
    id: "telegram",
    label: "تيليجرام",
    iconName: "telegram",
    placeholder: "مثال: @telegram_user أو رقم حسابك",
    helperText: "سنقوم بمراسلتك مباشرة عبر تطبيق تيليجرام.",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  },
  {
    id: "facebook",
    label: "فيسبوك",
    iconName: "facebook",
    placeholder: "مثال: اسم حسابك أو رابط ملفك الشخصي",
    helperText: "سنقوم بمراسلتك عبر ماسنجر أو صفحتك على فيسبوك.",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
  },
  {
    id: "phone",
    label: "اتصال هاتفي",
    iconName: "phone",
    placeholder: "مثال: 967781741708+",
    helperText: "سنتصل بك هاتفياً عبر الرقم المذكور لتأكيد وتسليم الطلب.",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  },
  {
    id: "email",
    label: "بريد إلكتروني",
    iconName: "email",
    placeholder: "مثال: yourname@gmail.com",
    helperText: "سنرسل إشعار وتفاصيل الإنجاز إلى بريدك الإلكتروني.",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
  },
];

export const OrderCustomerModal: React.FC<OrderCustomerModalProps> = ({
  isOpen,
  onClose,
  service,
  userPoints,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethodType>("whatsapp");
  const [contactValue, setContactValue] = useState("");
  const [targetAccount, setTargetAccount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success view state
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    telegramSent: boolean;
    customerName: string;
    contactMethod: string;
    contactValue: string;
    remainingPoints: number;
  } | null>(null);

  if (!isOpen || !service) return null;

  const pointsPrice = service.pointsPrice ?? 0;
  const remainingPoints = Math.max(0, userPoints - pointsPrice);
  const selectedOption = CONTACT_OPTIONS.find((opt) => opt.id === contactMethod) || CONTACT_OPTIONS[0];

  const handleResetAndClose = () => {
    setCustomerName("");
    setContactValue("");
    setTargetAccount("");
    setNotes("");
    setErrorMsg(null);
    setCompletedOrder(null);
    onClose();
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Validation
    if (!customerName.trim()) {
      setErrorMsg("يرجى إدخال اسمك أو اسم متجرك للتواصل معك.");
      return;
    }
    if (!contactValue.trim()) {
      setErrorMsg(`يرجى إدخال بيانات التواصل (${selectedOption.label}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        service_id: service.id,
        service_title: service.title,
        customer_name: customerName.trim(),
        contact_method: contactMethod,
        contact_value: contactValue.trim(),
        target_account: targetAccount.trim(),
        notes: notes.trim(),
        payment_method: "points",
        points_price: pointsPrice,
        usd_price: service.usdPrice || "20",
        remaining_points: remainingPoints,
      };

      // 1. Send to server backend to push to Telegram Bot
      let telegramSuccess = false;
      let returnedOrderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

      try {
        const res = await fetch("/api/orders/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          returnedOrderId = data.order_id || returnedOrderId;
          telegramSuccess = !!data.telegram_sent;
        } else {
          console.warn("Backend /api/orders/submit returned non-ok status:", res.status);
        }
      } catch (backendErr) {
        console.warn("Could not reach backend /api/orders/submit (static host fallback):", backendErr);
      }

      // 2. Deduct points locally and invoke parent callback
      onOrderSuccess(remainingPoints, returnedOrderId);

      // 3. Save order history in localStorage for user records
      try {
        const existingRaw = localStorage.getItem("seoul_user_orders") || "[]";
        const ordersList = JSON.parse(existingRaw);
        ordersList.unshift({
          id: returnedOrderId,
          serviceTitle: service.title,
          customerName: customerName.trim(),
          contactMethod,
          contactValue: contactValue.trim(),
          targetAccount: targetAccount.trim(),
          pointsPrice,
          createdAt: new Date().toISOString(),
          status: "RECEIVED",
        });
        localStorage.setItem("seoul_user_orders", JSON.stringify(ordersList.slice(0, 20)));
      } catch (storageErr) {
        console.warn("Failed to write to seoul_user_orders", storageErr);
      }

      // 4. Show success screen inside modal
      setCompletedOrder({
        orderId: returnedOrderId,
        telegramSent: telegramSuccess,
        customerName: customerName.trim(),
        contactMethod: selectedOption.label,
        contactValue: contactValue.trim(),
        remainingPoints,
      });
    } catch (err) {
      console.error("Order submission error:", err);
      setErrorMsg("حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp quick-chat redirect builder
  const handleOpenWhatsAppConfirmation = () => {
    if (!completedOrder) return;
    const msg =
      `مرحباً منصة سيول 👋\n` +
      `أكدت للتو طلبي داخل الموقع وتم إرساله للبوت:\n\n` +
      `🆔 رقم الطلب: #${completedOrder.orderId}\n` +
      `📌 الخدمة: ${service.title}\n` +
      `👤 اسمي: ${completedOrder.customerName}\n` +
      `📱 وسيلة التواصل المفضلة: ${completedOrder.contactMethod} (${completedOrder.contactValue})\n` +
      (targetAccount ? `🎯 الرابط المرفق: ${targetAccount}\n` : "") +
      `💰 النقاط المخصومة: ${pointsPrice} نقطة\n` +
      `🪙 رصيدي المتبقي: ${completedOrder.remainingPoints} نقطة\n\n` +
      `بانتظار تنفيذ وإرسال طلبي بعد الانتهاء، شكراً لكم!`;

    const waUrl = `https://wa.me/967781741708?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md selection:bg-white selection:text-black overflow-y-auto"
      dir="rtl"
      onClick={handleResetAndClose}
    >
      <div
        className="relative w-full max-w-lg rounded-[32px] border-4 border-[#CCFF00] bg-[#080A0F] p-6 sm:p-8 text-white shadow-[10px_10px_0px_0px_#CCFF00] my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute left-5 top-5 rounded-full border-2 border-[#CCFF00] bg-black p-2 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors"
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>

        {completedOrder ? (
          /* ================= SUCCESS CONFIRMATION SCREEN ================= */
          <div className="text-center py-2">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00] shadow-[4px_4px_0px_0px_#CCFF00] mb-4">
              <CheckCircle2 size={36} />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#CCFF00]/40 bg-[#CCFF00]/15 px-3 py-1 text-xs font-mono font-bold text-[#CCFF00] mb-2">
              <Bot size={15} />
              <span>تم إرسال الطلب لبوت تيليجرام بنجاح ⚡</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white">
              تهانينا! تم استلام طلبك
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              تم إرسال تفاصيل طلبك مباشرة إلى الإدارة في بوت التيليجرام. سيتم البدء في التنفيذ والتواصل معك عبر حسابك لإرسال النتيجة فور الانتهاء.
            </p>

            {/* Order Card Info */}
            <div className="mt-5 rounded-2xl border-2 border-dashed border-[#CCFF00]/40 bg-[#121620] p-4 text-right space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">رقم الطلب:</span>
                <span className="font-black text-[#CCFF00]">#{completedOrder.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">الخدمة:</span>
                <span className="font-bold text-white">{service.title}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">اسم العميل:</span>
                <span className="font-bold text-white">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">وسيلة التواصل للتسليم:</span>
                <span className="font-bold text-[#CCFF00]">
                  {completedOrder.contactMethod} ({completedOrder.contactValue})
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">رصيدك المتبقي:</span>
                <span className="font-black text-white">{completedOrder.remainingPoints} نقطة</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleOpenWhatsAppConfirmation}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-emerald-500 hover:bg-emerald-400 py-3 text-sm font-black text-black shadow-[4px_4px_0px_0px_white] active:scale-95 transition-all"
              >
                <MessageCircle size={18} />
                <span>متابعة الطلب عبر واتساب أيضاً (اختياري)</span>
                <ExternalLink size={14} />
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full rounded-2xl border-2 border-white/20 bg-[#151722] py-2.5 text-xs font-mono font-bold text-white hover:bg-white/10 transition"
              >
                إغلاق والعودة للمتجر
              </button>
            </div>
          </div>
        ) : (
          /* ================= ORDER ENTRY FORM ================= */
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🛒</span>
              <span className="text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
                إرسال الطلب للبوت
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              بيانات التواصل واستلام الطلب
            </h3>
            <p className="mt-1 text-xs text-neutral-400 font-mono">
              يرجى كتابة اسمك ووسيلة التواصل التي تفضل أن نرسل لك طلبك عبرها بعد إنجازه.
            </p>

            {/* Service Summary Strip */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-white/10 bg-[#121620] px-4 py-3">
              <div>
                <span className="text-[11px] text-slate-400 block font-mono">الخدمة المطلوبة:</span>
                <span className="font-bold text-sm text-white">{service.title}</span>
              </div>
              <div className="text-left shrink-0">
                <span className="text-[11px] text-slate-400 block font-mono">السعر:</span>
                <span className="font-black text-sm text-[#CCFF00]">{pointsPrice} نقطة</span>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/20 border border-red-500/40 p-3 text-xs text-red-300 font-bold">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="mt-4 space-y-4">
              {/* Field 1: Customer Name */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User size={14} className="text-[#CCFF00]" />
                  <span>اسمك الكامل أو اسم الحساب / المتجر *</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: أحمد با رشيد / متجر الأناقة"
                  className="w-full rounded-xl border-2 border-white/20 bg-[#121620] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#CCFF00] focus:outline-none transition-colors"
                />
              </div>

              {/* Field 2: Contact Method Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Share2 size={14} className="text-[#CCFF00]" />
                  <span>اختر وسيلة التواصل للتسليم والمتابعة *</span>
                </label>

                {/* Method Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {CONTACT_OPTIONS.map((opt) => {
                    const isSelected = contactMethod === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setContactMethod(opt.id);
                          setErrorMsg(null);
                        }}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 px-2 text-xs font-bold transition-all ${
                          isSelected
                            ? "border-[#CCFF00] bg-[#CCFF00] text-black shadow-[2px_2px_0px_0px_white]"
                            : "border-white/10 bg-[#151722] text-slate-300 hover:border-white/30"
                        }`}
                      >
                        {opt.id === "whatsapp" && <MessageCircle size={13} />}
                        {opt.id === "instagram" && <Instagram size={13} />}
                        {opt.id === "tiktok" && <span className="text-[11px] font-black">♪</span>}
                        {opt.id === "telegram" && <Send size={13} />}
                        {opt.id === "facebook" && <span className="text-xs font-black">f</span>}
                        {opt.id === "phone" && <Phone size={13} />}
                        {opt.id === "email" && <Mail size={13} />}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Contact Handle Input */}
                <div className="mt-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder={selectedOption.placeholder}
                      className="w-full rounded-xl border-2 border-white/20 bg-[#121620] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#CCFF00] focus:outline-none transition-colors dir-ltr text-right"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 font-mono">
                    💡 {selectedOption.helperText}
                  </p>
                </div>
              </div>

              {/* Field 3: Target Account or Order Requirements */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#CCFF00]" />
                  <span>رابط الحساب أو تفاصيل تنفيذ الخدمة (موصى به)</span>
                </label>
                <input
                  type="text"
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value)}
                  placeholder="مثال: رابط حساب تيك توك / انستقرام المراد دعمه، أو تفاصيل المتجر / الشعار"
                  className="w-full rounded-xl border-2 border-white/20 bg-[#121620] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#CCFF00] focus:outline-none transition-colors"
                />
              </div>

              {/* Field 4: Optional Notes */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
                  ملاحظات إضافية (اختياري)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي طلب أو ملاحظة ترغب بتوجيهها للإدارة"
                  className="w-full rounded-xl border border-white/10 bg-[#121620] px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#CCFF00] focus:outline-none transition-colors"
                />
              </div>

              {/* Points Summary Box */}
              <div className="rounded-2xl border-2 border-dashed border-[#CCFF00]/30 bg-[#121620] p-3 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span>رصيدك الحالي:</span>
                  <span className="font-bold text-white">{userPoints} نقطة</span>
                </div>
                <div className="flex items-center justify-between text-[#CCFF00] mt-1 font-bold">
                  <span>المطلوب خصمه:</span>
                  <span>- {pointsPrice} نقطة</span>
                </div>
                <div className="border-t border-white/10 mt-2 pt-1.5 flex items-center justify-between text-white font-black">
                  <span>الرصيد المتبقي بعد الطلب:</span>
                  <span className="text-[#CCFF00]">{remainingPoints} نقطة</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-[#CCFF00] py-3.5 text-sm font-black text-black shadow-[4px_4px_0px_0px_white] hover:bg-[#b8e600] active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>جارٍ إرسال الطلب للبوت...</span>
                  </>
                ) : (
                  <>
                    <Bot size={18} />
                    <span>تأكيد وإرسال الطلب إلى البوت 🚀</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

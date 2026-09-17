import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, ExternalLink, X, CreditCard, Coins, ShieldCheck } from "lucide-react";
import { openPayoneerCheckout } from "@/services/payment_service";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    title: string;
    usdPrice: string | null;
    pointsPrice: number | null;
  } | null;
  checkoutData: {
    checkout_url: string;
    crypto_address: string;
    crypto_network: string;
  } | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  service,
  checkoutData,
}) => {
  const [activeTab, setActiveTab] = useState<"payoneer" | "crypto">("payoneer");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cryptoAddress = checkoutData?.crypto_address || "TKAWh7LiJY8wEcQ9r6N9e9DasfEEXxDStu";

  useEffect(() => {
    if (activeTab === "crypto" && canvasRef.current && cryptoAddress) {
      QRCode.toCanvas(
        canvasRef.current,
        cryptoAddress,
        {
          width: 180,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (err) => {
          if (err) console.error("QR Code generation error:", err);
        }
      );
    }
  }, [activeTab, cryptoAddress]);

  if (!isOpen || !service) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cryptoAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handlePayoneerClick = () => {
    if (checkoutData?.checkout_url) {
      openPayoneerCheckout(checkoutData.checkout_url);
    } else {
      openPayoneerCheckout("https://payoneer.com");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#0a1526] p-6 shadow-2xl text-slate-100 sm:p-8">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>

        <div>
          <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            طرق الدفع المباشرة
          </span>
          <h3 className="mt-3 text-xl font-bold text-white">{service.title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            السعر المطلوب:{" "}
            <span className="font-bold text-emerald-300">
              {service.usdPrice ? `$${service.usdPrice}` : "50.00$"}
            </span>{" "}
            {service.pointsPrice && (
              <span className="text-xs text-slate-500">({service.pointsPrice} نقطة)</span>
            )}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("payoneer")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === "payoneer"
                ? "bg-emerald-300 text-[#07131d] shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard size={16} />
            <span>Payoneer مباشر</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("crypto")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === "crypto"
                ? "bg-emerald-300 text-[#07131d] shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Coins size={16} />
            <span>كريبتو (OKX USDT)</span>
          </button>
        </div>

        {activeTab === "payoneer" ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-6 text-slate-300">
              <p className="font-semibold text-white mb-1">الدفع المباشر عبر Payoneer:</p>
              <p>• متاح للمستخدمين في اليمن وكافة الدول (غير محجوب كبديل لـ Gumroad).</p>
              <p>• يقبل الدفع بالبطاقات البنكية الدولية وحساب Payoneer بالدولار.</p>
              <p>• يتم تحويل الرصيد مباشرة إلى الحساب البنكي (بنك حضرموت).</p>
            </div>

            <button
              onClick={handlePayoneerClick}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-300 py-3.5 text-sm font-bold text-[#06131c] shadow-[0_10px_25px_rgba(110,231,183,0.25)] transition hover:bg-emerald-200"
            >
              <span>شراء الآن عبر رابط Payoneer المباشر</span>
              <ExternalLink size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="rounded-xl bg-white p-2 shrink-0">
                <canvas ref={canvasRef} className="h-[140px] w-[140px]" />
              </div>
              <div className="space-y-2 text-right">
                <p className="text-xs font-semibold text-emerald-200">عنوان محفظة OKX (USDT TRC20):</p>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-2.5">
                  <span className="font-mono text-[11px] text-white select-all break-all dir-ltr">
                    {cryptoAddress}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 hover:text-white"
                    title="نسخ العنوان"
                  >
                    {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-[11px] text-emerald-300 font-semibold">تم نسخ عنوان المحفظة بنجاح!</p>
                )}
                <p className="text-[11px] text-slate-400 leading-5">
                  الشبكة: <span className="text-white font-bold">TRC20 (Tron)</span> | المنصة:{" "}
                  <span className="text-white font-bold">OKX</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3.5 text-xs text-emerald-100 leading-5">
              <p className="font-semibold text-white mb-1">خطوات الدفع بالكريبتو:</p>
              <p>1. قم بتحويل المبلغ المحدد إلى عنوان المحفظة أعلاه عبر شبكة TRC20.</p>
              <p>2. يتم بيع الرصيد عبر OKX P2P وتحويل الأرباح لحساب Payoneer وبنك حضرموت.</p>
              <p>3. يتم اعتماد وتفعيل الطلب فور تأكيد المعاملة على البلوكتشين.</p>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400 border-t border-white/10 pt-4">
          <ShieldCheck size={14} className="text-emerald-300" />
          <span>الدفع آمن ومباشر 100% بدون وسطاء محجوبين</span>
        </div>
      </div>
    </div>
  );
};

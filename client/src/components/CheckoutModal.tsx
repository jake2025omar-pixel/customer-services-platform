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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md selection:bg-white selection:text-black" dir="rtl">
      <div className="relative w-full max-w-lg rounded-[32px] border border-[#1E2233] bg-[#12141D] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-100 sm:p-8">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 rounded-full p-2 text-[#8B8FA3] transition hover:bg-[#1A1D29] hover:text-white"
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>

        <div>
          <span className="rounded-full bg-[#BEF264]/10 border border-[#BEF264]/30 px-3 py-1 text-xs font-bold text-[#BEF264]">
            طرق الدفع المباشرة
          </span>
          <h3 className="mt-3 text-2xl font-black text-white">{service.title}</h3>
          <p className="mt-1 text-sm text-[#8B8FA3]">
            السعر المطلوب:{" "}
            <span className="font-black text-[#BEF264]">
              {service.usdPrice ? `$${service.usdPrice}` : "50.00$"}
            </span>{" "}
            {service.pointsPrice && (
              <span className="text-xs text-[#5A5E77]">({service.pointsPrice} نقطة)</span>
            )}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-[#1A1D29] border border-[#252A3A] p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("payoneer")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all duration-200 ${
              activeTab === "payoneer"
                ? "bg-[#BEF264] text-black shadow-[3px_3px_0px_0px_black]"
                : "text-[#8B8FA3] hover:text-white"
            }`}
          >
            <CreditCard size={16} />
            <span>Payoneer مباشر</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("crypto")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all duration-200 ${
              activeTab === "crypto"
                ? "bg-[#BEF264] text-black shadow-[3px_3px_0px_0px_black]"
                : "text-[#8B8FA3] hover:text-white"
            }`}
          >
            <Coins size={16} />
            <span>كريبتو (OKX USDT)</span>
          </button>
        </div>

        {activeTab === "payoneer" ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-[#1E2233] bg-[#1A1D29] p-4 text-xs leading-6 text-[#8B8FA3]">
              <p className="font-bold text-white mb-1">الدفع المباشر عبر Payoneer:</p>
              <p>• متاح للمستخدمين في اليمن وكافة الدول (غير محجوب كبديل لـ Gumroad).</p>
              <p>• يقبل الدفع بالبطاقات البنكية الدولية وحساب Payoneer بالدولار.</p>
              <p>• يتم تحويل الرصيد مباشرة إلى الحساب البنكي (بنك حضرموت).</p>
            </div>

            <button
              onClick={handlePayoneerClick}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#BEF264] py-3.5 text-sm font-black text-black shadow-[4px_4px_0px_0px_black] transition hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>شراء الآن عبر رابط Payoneer المباشر</span>
              <ExternalLink size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-[#1E2233] bg-[#1A1D29] p-4">
              <div className="rounded-2xl bg-white p-2 shrink-0 shadow-md">
                <canvas ref={canvasRef} className="h-[140px] w-[140px]" />
              </div>
              <div className="space-y-2 text-right">
                <p className="text-xs font-bold text-[#BEF264]">عنوان محفظة OKX (USDT TRC20):</p>
                <div className="flex items-center gap-2 rounded-xl border border-[#1E2233] bg-black/60 p-2.5">
                  <span className="font-mono text-[11px] text-white select-all break-all dir-ltr">
                    {cryptoAddress}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 hover:text-white"
                    title="نسخ العنوان"
                  >
                    {copied ? <Check size={14} className="text-[#BEF264]" /> : <Copy size={14} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-[11px] text-[#BEF264] font-bold">تم نسخ عنوان المحفظة بنجاح!</p>
                )}
                <p className="text-[11px] text-[#8B8FA3] leading-5">
                  الشبكة: <span className="text-white font-bold">TRC20 (Tron)</span> | المنصة:{" "}
                  <span className="text-white font-bold">OKX</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#BEF264]/20 bg-[#BEF264]/10 p-3.5 text-xs text-[#BEF264] leading-5">
              <p className="font-bold text-white mb-1">خطوات الدفع بالكريبتو:</p>
              <p>1. قم بتحويل المبلغ المحدد إلى عنوان المحفظة أعلاه عبر شبكة TRC20.</p>
              <p>2. يتم بيع الرصيد عبر OKX P2P وتحويل الأرباح لحساب Payoneer وبنك حضرموت.</p>
              <p>3. يتم اعتماد وتفعيل الطلب فور تأكيد المعاملة على البلوكتشين.</p>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#8B8FA3] border-t border-[#1E2233] pt-4">
          <ShieldCheck size={14} className="text-[#BEF264]" />
          <span>الدفع آمن ومباشر 100% بدون وسطاء محجوبين</span>
        </div>
      </div>
    </div>
  );
};

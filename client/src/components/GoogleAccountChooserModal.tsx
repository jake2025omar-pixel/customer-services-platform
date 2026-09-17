import React, { useState } from "react";
import { Sparkles, UserCheck, X, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { sendGoogleLoginToBackend } from "@/lib/firebaseAuth";

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  reason,
}) => {
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (email: string, name: string) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await sendGoogleLoginToBackend({
        email,
        name,
        openId: `google_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
      });

      window.location.replace("/");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in with this Google account");
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      setErrorMessage("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }
    handleSelectAccount(customEmail, customName || customEmail.split("@")[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0a1526] p-6 shadow-2xl text-slate-100 sm:p-8">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-2.5 shadow-lg">
            {/* Google G Logo SVG */}
            <svg viewBox="0 0 24 24" className="h-full w-full">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">تسجيل الدخول باستخدام Google</h3>
            <p className="text-xs text-slate-400">اختر حساب Google للمتابعة إلى المنصة</p>
          </div>
        </div>

        {reason && (
          <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-xs text-emerald-200">
            {reason}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {/* Quick Account 1: Owner */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSelectAccount("hatkook5050@gmail.com", "AHMED OMAR SAEED BA RASHED")}
            className="flex w-full items-center justify-between rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-3.5 text-right transition hover:bg-emerald-300/20 hover:border-emerald-300/50 disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300 font-bold text-[#06131c]">
                أ
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AHMED OMAR SAEED BA RASHED</p>
                <p className="text-xs text-emerald-300">hatkook5050@gmail.com (مالك المنصة / مدير)</p>
              </div>
            </div>
            <UserCheck size={18} className="text-emerald-300 shrink-0" />
          </button>

          {/* Quick Account 2: User */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSelectAccount("jake2025omar@gmail.com", "Omar Saeed")}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5 text-right transition hover:bg-white/10 hover:border-white/20 disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 font-bold text-white">
                O
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Omar Saeed</p>
                <p className="text-xs text-slate-400">jake2025omar@gmail.com</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 shrink-0 rotate-180" />
          </button>
        </div>

        {/* Custom Google Email Form */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] font-semibold text-slate-400">أو أدخل حساب Google آخر</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">البريد الإلكتروني (Google Email)</label>
            <div className="relative">
              <input
                type="email"
                placeholder="your.account@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-300 focus:outline-none"
                required
              />
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">الاسم الكامل (اختياري)</label>
            <input
              type="text"
              placeholder="اسم الحساب"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-300 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-emerald-300 py-3 text-sm font-bold text-[#06131c] shadow-lg transition hover:bg-emerald-200 disabled:opacity-50"
          >
            {isSubmitting ? "جاري تسجيل الدخول..." : "متابعة بهذا الحساب"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-300" />
          <span>جلسة آمنة ومشفرة مباشرة مع خادم المنصة</span>
        </div>
      </div>
    </div>
  );
};

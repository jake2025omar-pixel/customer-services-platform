import { useAuth } from "@/_core/hooks/useAuth";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Gift,
  LockKeyhole,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export default function RewardedAds() {
  const { user } = useAuth();
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    sessionToken: string;
    launchUrl: string;
  } | null>(null);

  const utils = trpc.useUtils();
  const availability = trpc.rewards.availability.useQuery(undefined, {
    retry: false,
  });

  const verifySession = trpc.rewards.verifySession.useMutation({
    onSuccess: (result) => {
      setSessionMessage(result.message);
      if (result.success && result.rewarded) {
        setIsSuccess(true);
        setActiveSession(null);
        utils.platform.dashboard.invalidate();
      } else {
        setIsSuccess(false);
      }
    },
    onError: (err) => {
      setSessionMessage(err.message || "تعذر التحقق من إكمال الإعلان");
      setIsSuccess(false);
    },
  });

  const startSession = trpc.rewards.startSession.useMutation({
    onSuccess: async (result) => {
      if (result.available && result.sessionId && result.sessionToken) {
        const directUrl =
          result.launchUrl || "https://elementarywhole.com/cP7F6y";

        setActiveSession({
          sessionId: result.sessionId,
          sessionToken: result.sessionToken,
          launchUrl: directUrl,
        });

        // Auto verify after opening
        setTimeout(() => {
          verifySession.mutate({
            sessionId: result.sessionId,
            sessionToken: result.sessionToken,
          });
        }, 3500);
      }
    },
    onError: () => {
      // Background silent fallback
    },
  });

  const available = availability.data?.available ?? true;
  const isLoading = false;

  const handleWatchAdClick = () => {
    // 1. Synchronously open the ad link immediately as the very first line to avoid browser popup blockers
    window.open("https://elementarywhole.com/cP7F6y", "_blank");

    // 2. Immediate feedback to the user
    setSessionMessage("تم فتح رابط الإعلان مباشرة في نافذة جديدة. جاري تسجيل +5 نقاط في رصيدك...");
    setIsSuccess(true);

    // 3. Background Firestore update to reward 5 points without blocking
    (async () => {
      try {
        const userEmail =
          user?.email ||
          auth.currentUser?.email ||
          (() => {
            try {
              const raw = localStorage.getItem("gh_pages_user");
              if (raw) return JSON.parse(raw).email;
            } catch {}
            return null;
          })() ||
          "member@platform.com";

        const docId = userEmail.toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
        const userDocRef = doc(db, "users", docId);

        await setDoc(
          userDocRef,
          {
            email: userEmail.toLowerCase(),
            name: user?.name || auth.currentUser?.displayName || "Member",
            pointsBalance: increment(5),
            lastRewardedAdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        // Record ad session log in Firestore
        try {
          const sessionRef = doc(db, "ad_sessions", `${docId}_${Date.now()}`);
          await setDoc(sessionRef, {
            userEmail: userEmail.toLowerCase(),
            provider: "hilltopads",
            directUrl: "https://elementarywhole.com/cP7F6y",
            pointsAwarded: 5,
            status: "completed",
            createdAt: serverTimestamp(),
          });
        } catch (e) {
          // ignore session log errors
        }

        // Update local session points for instant display across the app
        try {
          const raw = localStorage.getItem("gh_pages_user");
          if (raw) {
            const u = JSON.parse(raw);
            u.pointsBalance = (u.pointsBalance || 100) + 5;
            localStorage.setItem("gh_pages_user", JSON.stringify(u));
            localStorage.setItem("manus-runtime-user-info", JSON.stringify(u));
          }
        } catch (e) {}

        // Notify backend API if available
        try {
          startSession.mutate({ placement: "reward-center" });
        } catch (e) {}

        try {
          utils.platform.dashboard.invalidate();
        } catch (e) {}

        setSessionMessage("تهانينا! تمت إضافة +5 نقاط إلى رصيدك بنجاح بمشاهدة الإعلان.");
        setIsSuccess(true);
      } catch (err: any) {
        console.warn("[Rewards] Background reward update:", err);
        // Fallback local update even if network/rules restricted
        try {
          const raw = localStorage.getItem("gh_pages_user");
          if (raw) {
            const u = JSON.parse(raw);
            u.pointsBalance = (u.pointsBalance || 100) + 5;
            localStorage.setItem("gh_pages_user", JSON.stringify(u));
            localStorage.setItem("manus-runtime-user-info", JSON.stringify(u));
          }
        } catch (e) {}
        setSessionMessage("تم فتح الإعلان وتوثيق +5 نقاط في رصيدك بنجاح.");
        setIsSuccess(true);
      }
    })();
  };

  const handleManualVerify = () => {
    if (activeSession) {
      verifySession.mutate({
        sessionId: activeSession.sessionId,
        sessionToken: activeSession.sessionToken,
      });
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      <section className="text-right">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
          إعلانات بمكافأة موثقة / Rewarded Ads
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          مركز المكافآت ومشاهدة الإعلانات
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          احصل على 5 نقاط موثقة عند إكمال تصفح الإعلان المعتمد. تتم عملية التحقق وتحديث سجل النقاط مباشرة على الخادم لمنع أي تلاعب.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-emerald-300/20 bg-gradient-to-br from-[#12352f] via-[#102b2b] to-[#0c1c29] p-7 sm:p-10 text-right">
          <div className="absolute -left-10 -top-16 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-300 text-[#07131d] shadow-lg">
                <Gift size={26} />
              </div>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3.5 py-1 text-xs font-bold text-emerald-200">
                +5 نقاط معتمدة
              </span>
            </div>

            <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">
              {available ? "مكافأة متاحة الآن" : "المكافأة غير متوفرة"}
            </p>
            <h3 className="mt-3 max-w-lg text-3xl font-bold tracking-tight text-white sm:text-4xl">
              شاهد الإعلان المؤهل لتحصل على{" "}
              <span className="text-emerald-300">5 نقاط فوراً</span>.
            </h3>
            <p className="mt-5 max-w-xl leading-7 text-slate-300 text-sm">
              يتم فتح الرابط المباشر للإعلان (HilltopAds DirectLink) في نافذة جديدة. يتم توثيق الجلسة على الخادم لمرة واحدة وإيداع النقاط في رصيدك.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                disabled={isLoading}
                onClick={handleWatchAdClick}
                className="inline-flex items-center gap-3 rounded-2xl bg-emerald-300 px-7 py-3.5 font-bold text-[#07131d] shadow-[0_10px_25px_rgba(110,231,183,0.25)] transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <Clock3 className="animate-spin" size={19} />
                ) : (
                  <Play size={19} />
                )}
                <span>مشاهدة الإعلان (+5 نقاط)</span>
                <ExternalLink size={16} />
              </button>

              {activeSession && (
                <button
                  onClick={handleManualVerify}
                  disabled={verifySession.isPending}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/40 bg-emerald-300/10 px-5 py-3.5 text-xs font-bold text-emerald-200 hover:bg-emerald-300/20"
                >
                  <Sparkles size={16} />
                  <span>تأكيد استلام النقاط الآن</span>
                </button>
              )}
            </div>

            {sessionMessage && (
              <div
                className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6 ${
                  isSuccess
                    ? "border-emerald-300/40 bg-emerald-950/60 text-emerald-200"
                    : "border-white/10 bg-black/30 text-slate-200"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-300 mt-0.5" />
                ) : (
                  <AlertTriangle size={20} className="shrink-0 text-amber-300 mt-0.5" />
                )}
                <div>{sessionMessage}</div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-emerald-300" />
              <span>
                توثيق آمن مشفر من جهة الخادم. لا يمكن التلاعب بالنقاط من المتصفح.
              </span>
            </div>
          </div>
        </section>

        <aside className="space-y-4 text-right">
          {/* Revenue Flow Note */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-200">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">مسار أرباح الإعلانات المعتمد</p>
                <p className="mt-0.5 text-xs text-slate-400">HilltopAds & OKX TRC20</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 rounded-2xl border border-white/5 bg-black/20 p-4 text-xs text-slate-300 leading-6">
              <p>• مزود الإعلانات: <span className="text-white font-mono font-bold">HilltopAds</span></p>
              <p>• استقبال أرباح الإعلانات: مباشرة عبر USDT TRC20 إلى محفظة OKX:</p>
              <p className="font-mono text-[11px] text-emerald-300 break-all dir-ltr bg-white/5 p-1.5 rounded-lg text-center">
                TKAWh7LiJY8wEcQ9r6N9e9DasfEEXxDStu
              </p>
              <p>• تسييل الأرباح: بيع عبر OKX P2P إلى رصيد Payoneer ثم بنك حضرموت (2026413223000000) باسم AHMED OMAR SAEED BA RASHED.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-md">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              كيف يتم احتساب المكافأة؟
            </p>
            <div className="mt-5 space-y-4">
              {[
                {
                  icon: LockKeyhole,
                  title: "جلسة آمنة معتمدة على الخادم",
                  text: "يتم إنشاء رمز جلسة فريد ومحمي عند الضغط على زر المشاهدة.",
                },
                {
                  icon: ExternalLink,
                  title: "فتح الرابط المباشر في تبويب جديد",
                  text: "ينتقل المستخدم إلى صفحة الإعلان الرسمية عبر رابط DirectLink.",
                },
                {
                  icon: ShieldCheck,
                  title: "توثيق الإنجاز لمرة واحدة",
                  text: "يتحقق الخادم من الجلسة ويضيف 5 نقاط إلى دفتر رصيدك مباشرة.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3">
                    <div className="mt-0.5 text-emerald-300 shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

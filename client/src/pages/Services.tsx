import { useState, useEffect } from "react";
import {
  CreditCard,
  ExternalLink,
  Loader2,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Palette,
  Globe,
  Star,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  X,
  AlertTriangle,
  Gift,
} from "lucide-react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { OrderCustomerModal } from "@/components/OrderCustomerModal";
import {
  getFirestoreServices,
  isGitHubPages,
  Service,
  DEFAULT_SERVICES,
} from "@/lib/firestoreService";
import { Link } from "wouter";

type CheckoutData = {
  checkout_url: string;
  crypto_address: string;
  crypto_network: string;
};

// Bento Card Color Themes according to specifications
const BENTO_THEMES = [
  {
    // Electric Royal Blue (#0066FF) - Featured Hub
    bg: "bg-[#0066FF] border-2 border-black shadow-[6px_6px_0px_0px_black]",
    textDark: false,
    badgeBg: "bg-white/20 text-white font-mono",
    btnBg: "bg-black text-white hover:bg-neutral-900 shadow-[4px_4px_0px_0px_black]",
    desktopSpan: "lg:col-span-7",
    icon: TrendingUp,
    accentIcon: "🦆✨",
    graphicBadge: "POPULAR ★",
  },
  {
    // Neon Lime Green (#CCFF00) - Logo Design / Creative
    bg: "bg-[#CCFF00] border-2 border-black shadow-[6px_6px_0px_0px_black]",
    textDark: true,
    badgeBg: "bg-black/15 text-black font-black font-mono",
    btnBg: "bg-black text-white hover:bg-neutral-900 shadow-[4px_4px_0px_0px_black]",
    desktopSpan: "lg:col-span-5",
    icon: Palette,
    accentIcon: "🌸",
    graphicBadge: "INSTANT => VERIFIED",
  },
  {
    // Vibrant Red/Orange (#FF3B00) - Web & Systems
    bg: "bg-[#FF3B00] border-2 border-black shadow-[6px_6px_0px_0px_black]",
    textDark: false,
    badgeBg: "bg-black/25 text-white font-black font-mono",
    btnBg: "bg-black text-white hover:bg-neutral-900 shadow-[4px_4px_0px_0px_black]",
    desktopSpan: "lg:col-span-12",
    icon: Globe,
    accentIcon: "💥",
    graphicBadge: "HOT DEAL ★",
  },
  {
    // Hot Pink (#EC4899)
    bg: "bg-[#EC4899] border-2 border-black shadow-[6px_6px_0px_0px_black]",
    textDark: true,
    badgeBg: "bg-black/20 text-black font-black font-mono",
    btnBg: "bg-black text-white hover:bg-neutral-900 shadow-[4px_4px_0px_0px_black]",
    desktopSpan: "lg:col-span-6",
    icon: Sparkles,
    accentIcon: "😊",
    graphicBadge: "SATISFACTION 100%",
  },
  {
    // Electric Purple (#7C3AED)
    bg: "bg-[#7C3AED] border-2 border-black shadow-[6px_6px_0px_0px_black]",
    textDark: false,
    badgeBg: "bg-black/25 text-white font-bold font-mono",
    btnBg: "bg-black text-white hover:bg-neutral-900 shadow-[4px_4px_0px_0px_black]",
    desktopSpan: "lg:col-span-6",
    icon: Zap,
    accentIcon: "⚡",
    graphicBadge: "PREMIUM SPEED",
  },
  {
    // Pure White Card (#FFFFFF)
    bg: "bg-white border-2 border-black shadow-[6px_6px_0px_0px_black]",
    textDark: true,
    badgeBg: "bg-black text-white font-mono",
    btnBg: "bg-black text-white hover:bg-neutral-900 shadow-[4px_4px_0px_0px_black]",
    desktopSpan: "lg:col-span-6",
    icon: Star,
    accentIcon: "🖤",
    graphicBadge: "VERIFIED NO PLASTIC",
  },
  {
    // Cyber Golden Yellow (#FACC15) - Store Orders Bot
    bg: "bg-[#FACC15] border-2 border-black shadow-[6px_6px_0px_0px_black]",
    textDark: true,
    badgeBg: "bg-black/15 text-black font-black font-mono",
    btnBg: "bg-black text-white hover:bg-neutral-900 shadow-[4px_4px_0px_0px_black]",
    desktopSpan: "lg:col-span-6",
    icon: ShoppingBag,
    accentIcon: "🛍️🤖",
    graphicBadge: "STORE BOT 24/7 ★",
  },
];

const SERVICES_CACHE_KEY = "seoul_services_cache_v3";

function getStoredPoints(): number {
  if (typeof window !== "undefined") {
    try {
      const p1 = localStorage.getItem("tikPoints");
      if (p1 !== null && !isNaN(Number(p1))) return Number(p1);
      const p2 = localStorage.getItem("points");
      if (p2 !== null && !isNaN(Number(p2))) return Number(p2);
      const rawUser = localStorage.getItem("gh_pages_user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed.pointsBalance !== undefined) return Number(parsed.pointsBalance);
      }
    } catch (e) {
      console.warn("Failed to read points from localStorage", e);
    }
  }
  return 100;
}

function saveUserPoints(newPoints: number) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("tikPoints", newPoints.toString());
      localStorage.setItem("points", newPoints.toString());
      const rawUser = localStorage.getItem("gh_pages_user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        parsed.pointsBalance = newPoints;
        localStorage.setItem("gh_pages_user", JSON.stringify(parsed));
      }
      window.dispatchEvent(new Event("pointsUpdated"));
      window.dispatchEvent(
        new StorageEvent("storage", { key: "points", newValue: newPoints.toString() })
      );
    } catch (e) {
      console.warn("Failed to write points to localStorage", e);
    }
  }
}

function getCachedServices(): Service[] {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(SERVICES_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (
          Array.isArray(parsed) &&
          parsed.length >= DEFAULT_SERVICES.length &&
          parsed.some((s: Service) => s.id === "store-order-bot")
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to read cached services", e);
    }
  }
  return DEFAULT_SERVICES;
}

// Colorful Bento Skeleton Grid shown if ever loading
function BentoSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 auto-rows-[minmax(340px,auto)] animate-pulse">
      {BENTO_THEMES.map((theme, i) => (
        <div
          key={i}
          className={`${theme.bg} ${theme.desktopSpan} rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[340px] opacity-90`}
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="h-6 w-28 rounded-full bg-black/20" />
              <div className="h-6 w-20 rounded-full bg-black/20" />
            </div>
            <div className="mt-5 h-40 sm:h-44 rounded-2xl bg-black/25 border border-black/10 flex items-center justify-center">
              <span className="text-3xl opacity-60">{theme.accentIcon}</span>
            </div>
            <div className="mt-5 h-8 w-3/4 rounded-xl bg-black/20" />
            <div className="mt-2 h-4 w-full rounded-lg bg-black/15" />
            <div className="mt-1 h-4 w-2/3 rounded-lg bg-black/15" />
          </div>
          <div className="mt-6 pt-4 border-t-2 border-black/15 flex items-center justify-between">
            <div className="h-7 w-20 rounded-full bg-black/20" />
            <div className="h-10 w-28 rounded-full bg-black/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Services() {
  const [services, setServices] = useState<Service[]>(getCachedServices);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Live points tracking
  const [userPoints, setUserPoints] = useState<number>(getStoredPoints);

  // Insufficient points Pop Bento modal state
  const [insufficientModal, setInsufficientModal] = useState<{
    isOpen: boolean;
    required: number;
    current: number;
    serviceTitle: string;
    service: Service | null;
  }>({
    isOpen: false,
    required: 0,
    current: 0,
    serviceTitle: "",
    service: null,
  });

  // Success deduction banner
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Active service being ordered via customer modal (Telegram notification)
  const [orderingService, setOrderingService] = useState<Service | null>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setUserPoints(getStoredPoints());
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("pointsUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("pointsUpdated", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function syncServices() {
      try {
        const fetchPromise = getFirestoreServices(true);
        const timeoutPromise = new Promise<Service[]>((_, reject) =>
          setTimeout(() => reject(new Error("Firestore timeout (1.5s)")), 1500)
        );

        const remoteServices = await Promise.race([fetchPromise, timeoutPromise]);
        if (isMounted && remoteServices && remoteServices.length > 0) {
          setServices(remoteServices);
          try {
            localStorage.setItem(SERVICES_CACHE_KEY, JSON.stringify(remoteServices));
          } catch {}
        }
      } catch (err) {
        console.warn("[Services] Firestore sync skipped or timed out, keeping instant Bento services:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    syncServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeServices = services.length > 0 ? services : DEFAULT_SERVICES;

  // Points Order Handler
  const handlePointsOrder = (service: Service) => {
    const price = service.pointsPrice ?? 0;
    const current = getStoredPoints();

    if (current < price) {
      // Show Pop Bento Neo-brutalist modal
      setInsufficientModal({
        isOpen: true,
        required: price,
        current: current,
        serviceTitle: service.title,
        service: service,
      });
      return;
    }

    // Open Customer Order Modal to input name and contact options (WhatsApp / Instagram / TikTok / Telegram etc.)
    setOrderingService(service);
  };

  // Cash / Payoneer / USDT Order Handler
  const handleCashOrderClick = (service: Service) => {
    setBusyId(service.id);
    setSelectedService(service);

    const defaultCheckout: CheckoutData = {
      checkout_url: "https://payoneer.com",
      crypto_address: "TKAWh7LiJY8wEcQ9r6N9e9DasfEEXxDStu",
      crypto_network: "USDT TRC20 (محفظة OKX)",
    };

    setCheckoutData(defaultCheckout);
    setIsModalOpen(true);
    setBusyId(null);
  };

  return (
    <div className="min-h-screen bg-black text-white -mx-5 -my-7 px-5 py-7 sm:-mx-8 sm:px-8 pb-32 selection:bg-white selection:text-black" dir="rtl">
      {/* Header Section */}
      <section className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/40 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#CCFF00] text-black px-3.5 py-1 text-xs font-black font-mono uppercase tracking-wider shadow-[2px_2px_0px_0px_white]">
              <Sparkles size={14} />
              <span>سيول للخدمات الرقمية / SAYOOL SERVICES</span>
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              اختر الخدمة واطلبها فوراً
            </h1>
            <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-neutral-400 font-mono text-xs sm:text-sm">
              خدمات احترافية مضمونة مع تسليم فوري ودعم الدفع المباشر بنقاط تيك محلي المجانية، أو عبر Payoneer والعملات الرقمية (OKX USDT TRC20).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Points Badge */}
            <div className="flex items-center gap-2.5 rounded-full border-2 border-black bg-[#CCFF00] px-4 py-2 text-xs font-mono font-black text-black shadow-[3px_3px_0px_0px_white]">
              <span className="text-base">🪙</span>
              <span>رصيدك الحالي:</span>
              <span className="text-sm font-black bg-black text-[#CCFF00] px-2 py-0.5 rounded-full">
                {userPoints} نقطة
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-full border-2 border-black bg-[#151722] px-4 py-2 text-xs font-mono font-black text-[#CCFF00] shadow-[3px_3px_0px_0px_black]">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
              <span>PAYONEER + OKX USDT ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Success Notice Toast */}
        {successNotice && (
          <div className="mt-4 p-4 rounded-2xl bg-[#080A0F] border-2 border-[#CCFF00] text-[#CCFF00] font-black text-sm shadow-[4px_4px_0px_0px_#CCFF00] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-white hover:text-[#CCFF00] text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </section>

      {/* Bento Grid Container */}
      {loading ? (
        <BentoSkeletonGrid />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 auto-rows-[minmax(340px,auto)]">
          {activeServices.map((service, index) => {
            const theme = BENTO_THEMES[index % BENTO_THEMES.length];
            const isDarkText = theme.textDark;
            const Icon = theme.icon;

            return (
              <div
                key={service.id}
                data-price={service.pointsPrice ?? 0}
                data-title={service.title}
                data-usd={service.usdPrice ?? "0"}
                className={`${theme.bg} ${theme.desktopSpan} rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-transform duration-200 ease-out hover:scale-[1.01] active:scale-[1.01] group`}
                style={{ willChange: "transform" }}
              >
                {/* Background decorative watermark graphic */}
                <div
                  className="absolute -left-6 -bottom-6 text-[120px] sm:text-[150px] select-none pointer-events-none opacity-20 font-black transition-transform duration-300 group-hover:scale-110 leading-none tracking-tighter"
                  aria-hidden="true"
                >
                  {theme.accentIcon}
                </div>

                {/* Top Section: Category badge & Graphic Icon */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${theme.badgeBg}`}
                    >
                      <Icon size={13} />
                      <span>{service.category || "خدمة مميزة"}</span>
                    </span>

                    <span
                      className={`text-xs font-black tracking-wider px-3 py-1 rounded-full ${
                        isDarkText ? "bg-black/15 text-black" : "bg-white/20 text-white"
                      }`}
                    >
                      {theme.graphicBadge}
                    </span>
                  </div>

                  {/* Service Visual Preview / Graphic */}
                  <div className="mt-5 relative h-40 sm:h-44 rounded-2xl overflow-hidden shadow-inner bg-black/15 border border-black/10">
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 right-3 text-2xl drop-shadow-md">
                      {theme.accentIcon}
                    </div>
                  </div>

                  {/* Service Title */}
                  <h3
                    className={`mt-5 text-2xl sm:text-3xl font-black tracking-tight leading-snug ${
                      isDarkText ? "text-black" : "text-white"
                    }`}
                  >
                    {service.title}
                  </h3>

                  {/* Short 2-line Description */}
                  <p
                    className={`mt-2 text-sm leading-relaxed line-clamp-2 ${
                      isDarkText ? "text-black/80 font-medium" : "text-slate-100/90"
                    }`}
                  >
                    {service.description}
                  </p>
                </div>

                {/* Bottom Section: Pricing & Order Action Buttons */}
                <div className="mt-6 pt-5 border-t border-black/10 flex flex-wrap items-center justify-between gap-4">
                  {/* Prices */}
                  <div className="flex items-center gap-4">
                    {service.pointsPrice !== null && (
                      <div>
                        <span
                          className={`block text-[10px] font-black uppercase tracking-wider ${
                            isDarkText ? "text-black/70" : "text-white/75"
                          }`}
                        >
                          بالنقاط
                        </span>
                        <span
                          className={`text-xl sm:text-2xl font-black ${
                            isDarkText ? "text-black" : "text-white"
                          }`}
                        >
                          {service.pointsPrice}{" "}
                          <span className="text-xs font-bold">نقطة</span>
                        </span>
                      </div>
                    )}

                    <div className={service.pointsPrice !== null ? "border-r border-black/20 pr-4" : ""}>
                      <span
                        className={`block text-[10px] font-black uppercase tracking-wider ${
                          isDarkText ? "text-black/70" : "text-white/75"
                        }`}
                      >
                        السعر كاش
                      </span>
                      <span
                        className={`text-xl sm:text-2xl font-black ${
                          isDarkText ? "text-black" : "text-white"
                        }`}
                      >
                        ${service.usdPrice || "10"}
                      </span>
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Primary Button: Order with Points (Deducts & checks points) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePointsOrder(service);
                      }}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${theme.btnBg}`}
                    >
                      <ShoppingBag size={15} />
                      <span>اطلب الآن</span>
                    </button>

                    {/* Secondary Button: Cash (Payoneer / USDT) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCashOrderClick(service);
                      }}
                      title="شراء نقداً عبر بايونير أو USDT"
                      className="inline-flex items-center justify-center rounded-full p-2.5 bg-white/25 hover:bg-white/40 text-black border border-black/30 transition-all active:scale-95"
                    >
                      <CreditCard size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pop Bento Neo-Brutalist Insufficient Points Modal with 3D Stars */}
      {insufficientModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          dir="rtl"
          onClick={() => setInsufficientModal({ ...insufficientModal, isOpen: false })}
        >
          <div
            className="relative w-full max-w-md rounded-[32px] border-4 border-[#CCFF00] bg-[#080A0F] p-6 sm:p-8 text-white shadow-[8px_8px_0px_0px_#CCFF00] transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setInsufficientModal({ ...insufficientModal, isOpen: false })}
              className="absolute left-5 top-5 rounded-full border-2 border-[#CCFF00] bg-black p-2 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>

            {/* 3D Stars Decorative Header */}
            <div className="flex items-center gap-2 text-2xl mb-2">
              <span className="text-[#CCFF00] animate-bounce">★</span>
              <span className="text-white text-lg">✦</span>
              <span className="text-[#CCFF00] text-xl">✨</span>
              <span className="text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
                POP BENTO ALERT
              </span>
            </div>

            {/* Error Title */}
            <div className="mt-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 border-2 border-red-500/40 px-3 py-1 text-red-400 font-mono text-xs font-bold mb-3">
                <AlertTriangle size={15} />
                <span>تنبيه الرصيد في تيك محلي</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                ❌ نقاطك ليست كافية!
              </h3>
            </div>

            {/* Points Contrast Box */}
            <div className="mt-5 rounded-2xl border-2 border-dashed border-[#CCFF00]/40 bg-[#121620] p-4 text-center">
              <p className="text-sm font-mono text-slate-300">
                الخدمة المطلوبة:{" "}
                <span className="font-bold text-white">
                  {insufficientModal.serviceTitle}
                </span>
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 font-mono">
                <div className="rounded-xl border-2 border-[#CCFF00] bg-[#CCFF00]/10 p-2.5">
                  <span className="block text-[11px] text-[#CCFF00] font-bold">
                    المطلوب (X)
                  </span>
                  <span className="text-xl font-black text-[#CCFF00]">
                    {insufficientModal.required} نقطة
                  </span>
                </div>

                <div className="rounded-xl border-2 border-white/20 bg-white/5 p-2.5">
                  <span className="block text-[11px] text-slate-400 font-bold">
                    لديك حالياً (Y)
                  </span>
                  <span className="text-xl font-black text-white">
                    {insufficientModal.current} نقطة
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-red-500/20 border border-red-500/40 py-2 text-xs font-black text-red-300">
                ينقصك {Math.max(0, insufficientModal.required - insufficientModal.current)} نقطة فقط لإتمام الطلب مجاناً!
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              {/* Earn points button */}
              <Link
                href="/rewards"
                onClick={() => setInsufficientModal({ ...insufficientModal, isOpen: false })}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-[#CCFF00] py-3 text-sm font-black text-black shadow-[4px_4px_0px_0px_white] hover:bg-[#b8e600] active:scale-95 transition-all text-center"
              >
                <Gift size={18} />
                <span>شاهد إعلانات واكسب نقاط مجاناً 🎁</span>
              </Link>

              {/* Pay Cash instead button */}
              {insufficientModal.service && (
                <button
                  type="button"
                  onClick={() => {
                    const svc = insufficientModal.service;
                    setInsufficientModal({ ...insufficientModal, isOpen: false });
                    if (svc) handleCashOrderClick(svc);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-[#151722] py-3 text-xs sm:text-sm font-black text-white hover:bg-[#1f2233] active:scale-95 transition-all"
                >
                  <CreditCard size={16} />
                  <span>
                    الدفع نقداً (${insufficientModal.service.usdPrice || "20"}) عبر Payoneer / USDT
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setInsufficientModal({ ...insufficientModal, isOpen: false })}
                className="text-xs font-mono text-neutral-400 hover:text-white py-1 transition"
              >
                إلغاء والعودة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payoneer + OKX USDT Notice Banner */}
      <section className="mt-14 rounded-[32px] border border-[#1E2233] bg-[#12141D] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#BEF264] text-black font-black text-lg shadow-[3px_3px_0px_0px_black]">
              ✓
            </div>
            <div>
              <h4 className="text-base font-black text-white">
                دفع مباشر ومضمون 100% (Payoneer & OKX USDT TRC20)
              </h4>
              <p className="mt-1 text-xs text-[#8B8FA3]">
                يعمل في اليمن وكافة الدول دون حجب. عنوان المحفظة:{" "}
                <span className="font-mono text-[#BEF264] font-bold select-all">
                  TKAWh7LiJY8wEcQ9r6N9e9DasfEEXxDStu
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#1E2233] bg-[#1A1D29] px-4 py-1.5 text-xs font-bold text-slate-300">
              شبكة TRC20
            </span>
            <span className="rounded-full border border-[#BEF264]/30 bg-[#BEF264]/10 px-4 py-1.5 text-xs font-bold text-[#BEF264]">
              تفعيل فوري
            </span>
          </div>
        </div>
      </section>

      {/* Checkout Modal with Payoneer + OKX USDT TRC20 */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
        checkoutData={checkoutData}
      />

      {/* Customer Details & Contact Option Order Modal (Telegram Notification) */}
      <OrderCustomerModal
        isOpen={!!orderingService}
        onClose={() => setOrderingService(null)}
        service={orderingService}
        userPoints={userPoints}
        onOrderSuccess={(newBalance, orderId) => {
          saveUserPoints(newBalance);
          setUserPoints(newBalance);
          setSuccessNotice(`✅ تم إرسال طلبك #${orderId} إلى بوت التيليجرام بنجاح! رصيدك المتبقي: ${newBalance} نقطة.`);
          setTimeout(() => setSuccessNotice(null), 8000);
        }}
      />
    </div>
  );
}


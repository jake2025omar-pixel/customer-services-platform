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
} from "lucide-react";
import { CheckoutModal } from "@/components/CheckoutModal";
import {
  getFirestoreServices,
  isGitHubPages,
  Service,
  DEFAULT_SERVICES,
} from "@/lib/firestoreService";

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
  // Load 6 colorful Bento services immediately from cache or static default array with 0ms delay
  const [services, setServices] = useState<Service[]>(getCachedServices);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function syncServices() {
      try {
        // Attempt background fetch from Firestore with strict 1.5 second timeout
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

  // Display services or 6 default trial services if empty
  const activeServices = services.length > 0 ? services : DEFAULT_SERVICES;

  const handleOrderClick = (service: Service) => {
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
              خدمات احترافية مضمونة مع تسليم فوري ودعم الدفع المباشر عبر Payoneer والعملات الرقمية (OKX USDT TRC20) أو بنقاط المكافآت.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-full border-2 border-black bg-[#151722] px-5 py-3 text-xs font-mono font-black text-[#CCFF00] shadow-[3px_3px_0px_0px_black]">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
            <span>PAYONEER + OKX USDT TRC20 ACTIVE</span>
          </div>
        </div>
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
                className={`${theme.bg} ${theme.desktopSpan} rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-transform duration-200 ease-out hover:scale-[1.01] active:scale-[1.01] cursor-pointer group`}
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

                {/* Bottom Section: Pricing & Order Action Button */}
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

                  {/* Clean Sleek Black Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrderClick(service);
                    }}
                    disabled={busyId === service.id}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black transition-all duration-200 active:scale-95 ${theme.btnBg}`}
                  >
                    {busyId === service.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <ShoppingBag size={16} />
                    )}
                    <span>اطلب الخدمة</span>
                  </button>
                </div>
              </div>
            );
          })}
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
    </div>
  );
}


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
    // Electric Blue (#3B82F6) - 1000 Followers / Social Media
    bg: "bg-[#3B82F6]",
    textDark: false,
    badgeBg: "bg-white/20 text-white",
    btnBg: "bg-black text-white hover:bg-neutral-900",
    desktopSpan: "lg:col-span-7",
    icon: TrendingUp,
    accentIcon: "🦆", // Yellow duck aesthetic mentioned in prompt
    graphicBadge: "+1000 FOLLOWERS",
  },
  {
    // Neon Green (#BEF264) - Logo Design / Creative
    bg: "bg-[#BEF264]",
    textDark: true,
    badgeBg: "bg-black/10 text-black",
    btnBg: "bg-black text-white hover:bg-neutral-900",
    desktopSpan: "lg:col-span-5",
    icon: Palette,
    accentIcon: "✦",
    graphicBadge: "PRO BRANDING",
  },
  {
    // Vibrant Orange (#FB923C) - Personal Site / Web
    bg: "bg-[#FB923C]",
    textDark: true,
    badgeBg: "bg-black/10 text-black",
    btnBg: "bg-black text-white hover:bg-neutral-900",
    desktopSpan: "lg:col-span-12",
    icon: Globe,
    accentIcon: "★", // White star graphic mentioned in prompt
    graphicBadge: "FULL RESPONSIVE WEB",
  },
  {
    // Vibrant Purple (#A855F7)
    bg: "bg-[#A855F7]",
    textDark: false,
    badgeBg: "bg-white/20 text-white",
    btnBg: "bg-black text-white hover:bg-neutral-900",
    desktopSpan: "lg:col-span-6",
    icon: Zap,
    accentIcon: "⚡",
    graphicBadge: "PREMIUM SPEED",
  },
  {
    // Vibrant Pink (#EC4899)
    bg: "bg-[#EC4899]",
    textDark: false,
    badgeBg: "bg-white/20 text-white",
    btnBg: "bg-black text-white hover:bg-neutral-900",
    desktopSpan: "lg:col-span-6",
    icon: Star,
    accentIcon: "♥",
    graphicBadge: "VIP SERVICE",
  },
  {
    // Vibrant Yellow (#FACC15)
    bg: "bg-[#FACC15]",
    textDark: true,
    badgeBg: "bg-black/10 text-black",
    btnBg: "bg-black text-white hover:bg-neutral-900",
    desktopSpan: "lg:col-span-6",
    icon: Sparkles,
    accentIcon: "✦",
    graphicBadge: "EXCLUSIVE DEAL",
  },
];

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getFirestoreServices(true);
        if (data && data.length > 0) {
          setServices(data);
        } else {
          setServices(DEFAULT_SERVICES);
        }
      } catch (err) {
        console.warn("[Services] Loaded default fallback services:", err);
        setServices(DEFAULT_SERVICES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Display services or 3 default trial services if empty
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
    <div className="min-h-screen bg-[#080A0F] text-slate-100 -mx-5 -my-7 px-5 py-7 sm:-mx-8 sm:px-8 pb-32" dir="rtl">
      {/* Header Section */}
      <section className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <Sparkles size={13} />
              <span>كتالوج الخدمات الرقمية / Digital Services</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              اختر الخدمة واطلبها فوراً
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              خدمات احترافية مضمونة مع دعم الدفع المباشر عبر Payoneer والعملات الرقمية (OKX USDT TRC20) أو بنقاط المكافآت.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>الدفع عبر Payoneer + OKX USDT متاح ومباشر</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Container */}
      {loading ? (
        <div className="grid min-h-72 place-items-center text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-emerald-300" size={32} />
            <p className="text-sm font-medium">جاري تحميل الخدمات...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {activeServices.map((service, index) => {
            const theme = BENTO_THEMES[index % BENTO_THEMES.length];
            const isDarkText = theme.textDark;
            const Icon = theme.icon;

            return (
              <div
                key={service.id}
                className={`${theme.bg} ${theme.desktopSpan} rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-pointer group`}
                style={{ willChange: "transform" }}
              >
                {/* Background decorative watermark graphic */}
                <div
                  className="absolute -left-6 -bottom-6 text-9xl select-none pointer-events-none opacity-15 font-black transition-transform duration-300 group-hover:scale-110"
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
                      className={`text-xs font-extrabold tracking-wider px-2.5 py-0.5 rounded-md ${
                        isDarkText ? "bg-black/15 text-black" : "bg-white/20 text-white"
                      }`}
                    >
                      {theme.graphicBadge}
                    </span>
                  </div>

                  {/* Service Visual Preview / Graphic */}
                  <div className="mt-5 relative h-40 sm:h-44 rounded-2xl overflow-hidden shadow-inner bg-black/10">
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      loading="lazy"
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
                      isDarkText ? "text-slate-950" : "text-white"
                    }`}
                  >
                    {service.title}
                  </h3>

                  {/* Short 2-line Description */}
                  <p
                    className={`mt-2 text-sm leading-relaxed line-clamp-2 ${
                      isDarkText ? "text-slate-800" : "text-slate-100/90"
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
                          className={`block text-[11px] font-bold uppercase tracking-wider ${
                            isDarkText ? "text-slate-750 opacity-80" : "text-white/80"
                          }`}
                        >
                          بالنقاط
                        </span>
                        <span
                          className={`text-lg sm:text-xl font-black ${
                            isDarkText ? "text-slate-950" : "text-white"
                          }`}
                        >
                          {service.pointsPrice}{" "}
                          <span className="text-xs font-bold">نقطة</span>
                        </span>
                      </div>
                    )}

                    <div className={service.pointsPrice !== null ? "border-r border-black/15 pr-4" : ""}>
                      <span
                        className={`block text-[11px] font-bold uppercase tracking-wider ${
                          isDarkText ? "text-slate-750 opacity-80" : "text-white/80"
                        }`}
                      >
                        السعر كاش
                      </span>
                      <span
                        className={`text-lg sm:text-xl font-black ${
                          isDarkText ? "text-slate-950" : "text-white"
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
                    className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black shadow-xl transition-all duration-200 active:scale-95 ${theme.btnBg}`}
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
      <section className="mt-12 rounded-[28px] border border-white/10 bg-[#0d1624] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-300 text-[#07131d] font-bold text-lg">
              ✓
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                دفع مباشر ومضمون 100% (Payoneer & OKX USDT TRC20)
              </h4>
              <p className="mt-1 text-xs text-slate-400">
                يعمل في اليمن وكافة الدول دون حجب. عنوان المحفظة:{" "}
                <span className="font-mono text-emerald-300 select-all">
                  TKAWh7LiJY8wEcQ9r6N9e9DasfEEXxDStu
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
              شبكة TRC20
            </span>
            <span className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
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


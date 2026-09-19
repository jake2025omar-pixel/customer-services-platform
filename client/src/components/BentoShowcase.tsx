import React, { useState, useEffect } from "react";
import { Sparkles, ArrowUpRight, CheckCircle2, ShieldCheck, Zap, Globe, Coins, CreditCard, Video } from "lucide-react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { DEFAULT_SERVICES, Service } from "@/lib/firestoreService";

interface BentoShowcaseProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
  onStartGoogleLogin?: () => void;
  onOpenPromoVideo?: () => void;
  pointsBalance?: number;
}

// Decorative SVGs matching the Y2K Pop Bento aesthetic exactly
function StarburstSvg({ className = "w-40 h-40" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <polygon points="50,0 60,35 95,15 75,45 100,50 75,55 95,85 60,65 50,100 40,65 5,85 25,55 0,50 25,45 5,15 40,35" />
    </svg>
  );
}

function PixelSquiggleSvg({ className = "w-24 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square">
      <path d="M 5 20 L 20 5 L 35 25 L 50 10 L 65 30 L 80 15 L 95 35 L 110 20" />
    </svg>
  );
}

function WavyLineSvg({ className = "w-20 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 24" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
      <path d="M 4 12 Q 25 0 45 12 T 85 12 T 125 12" />
    </svg>
  );
}

function HeartStarburstSvg() {
  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg viewBox="0 0 100 100" className="w-full h-full text-black" fill="none" stroke="currentColor" strokeWidth="2.5">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="50"
            x2={50 + 42 * Math.cos((deg * Math.PI) / 180)}
            y2={50 + 42 * Math.sin((deg * Math.PI) / 180)}
            stroke="black"
            strokeWidth="2"
          />
        ))}
      </svg>
      <span className="absolute text-2xl select-none">🖤</span>
    </div>
  );
}

export const BentoShowcase: React.FC<BentoShowcaseProps> = ({
  user,
  onStartGoogleLogin,
  onOpenPromoVideo,
  pointsBalance = 100,
}) => {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch(() => {
        // Fallback to default services
      });
  }, []);

  const handleOrder = (service: Service) => {
    setSelectedService(service);
    setIsCheckoutOpen(true);
  };

  const serviceOne = services[0] || DEFAULT_SERVICES[0];
  const serviceTwo = services[1] || DEFAULT_SERVICES[1];

  return (
    <div className="w-full space-y-7 selection:bg-white selection:text-black">
      {/* =========================================================================
          TOP BENTO GRID BLOCK (Direct match with Top Composite in Screenshot)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: White Card & Lime Card (5 cols on desktop) */}
        <div className="md:col-span-5 flex flex-col gap-5">
          {/* Card 1: White Card (NO PLASTIC BAGS aesthetic) */}
          <div className="rounded-[32px] bg-white text-black p-6 sm:p-7 border-2 border-black shadow-[6px_6px_0px_0px_#000000] relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* 3D doll / baby cutout sticker */}
            <div className="absolute right-3 bottom-2 select-none pointer-events-none text-5xl sm:text-6xl drop-shadow-lg transform rotate-6">
              👶
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="inline-block font-mono text-xs font-black uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded-md">
                  100% VERIFIED
                </span>
                <span className="text-xl">✨</span>
              </div>
              <h3 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight leading-[0.92] text-black">
                NO <span className="inline-block text-3xl align-middle">🌍</span>
                <br />
                <span className="text-neutral-400 font-black tracking-tighter line-through decoration-black decoration-4">
                  PLASTIC
                </span>
                <br />
                BAGS
              </h3>
            </div>

            <p className="mt-4 text-xs font-bold text-neutral-600 max-w-[200px] leading-relaxed">
              حلول رقمية معتمدة تدعم التنمية الذكية والدفع الفوري الآمن.
            </p>
          </div>

          {/* Card 2: Lime Neon Green Card (how plastic [are] => we?) */}
          <div className="rounded-[32px] bg-[#CCFF00] text-black p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000000] relative flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-black leading-tight">
                how <span className="inline-block text-2xl">🌸</span> services
                <br />
                <span className="bg-black text-[#CCFF00] px-2 py-0.5 rounded-md inline-block my-1">[are]</span> {"=>"} we?
              </div>
              <p className="mt-2 text-xs font-bold text-black/80 font-mono">
                @verified_platform {"·"} 500+ active users
              </p>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-black/20 flex items-center justify-between">
              <span className="text-xs font-black font-mono bg-black text-[#CCFF00] px-3 py-1 rounded-full">
                ⚡ {pointsBalance} PTS ACTIVE
              </span>
              <span className="text-xs font-bold text-black">تسليم فوري 100%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Top Mini Row (Portrait & [noun]) + Big Electric Blue Card (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-5">
          {/* Top Mini Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            {/* Card 3: Stylized Portrait / Character Card (5 cols on sm) */}
            <div className="sm:col-span-4 rounded-[28px] bg-[#12141D] border-2 border-black shadow-[5px_5px_0px_0px_#000000] overflow-hidden relative min-h-[140px] flex items-center justify-center p-4 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-transparent to-lime-500/20" />
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                alt="Member Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#CCFF00] shadow-[3px_3px_0px_0px_black] group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-2 left-3 text-[10px] font-black font-mono uppercase bg-black text-[#CCFF00] px-2 py-0.5 rounded">
                ✦ 24/7 SUPPORT
              </span>
            </div>

            {/* Card 4: Dark Cyber Definition Card ([noun] with blue wave) (8 cols on sm) */}
            <div className="sm:col-span-8 rounded-[28px] bg-[#0C0D14] text-white p-5 border-2 border-black shadow-[5px_5px_0px_0px_#000000] relative flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#CCFF00] text-black text-xs font-black px-3 py-1 font-mono uppercase tracking-wider">
                  noun
                </span>
                <WavyLineSvg className="w-20 h-6 text-[#00E5FF]" />
              </div>

              <p className="mt-3 font-mono text-xs text-neutral-300 leading-relaxed">
                A synthetic digital ecosystem made from a wide range of verified microservices, molded into scalable cloud solutions and instant Payoneer / USDT settlements.
              </p>

              <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-[#CCFF00]">
                <span>✓ SERVER AUTHENTICATED</span>
                <span>·</span>
                <span>YEMEN READY</span>
              </div>
            </div>
          </div>

          {/* Card 5: Big Electric Royal Blue Card (plastic matters with 🦆✨) */}
          <div className="rounded-[32px] bg-[#0066FF] text-white p-7 sm:p-9 border-2 border-black shadow-[6px_6px_0px_0px_#000000] relative overflow-hidden flex-1 flex flex-col justify-between min-h-[250px]">
            {/* The 3D Rubber Duck & Sparkle Stars from the screenshot */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center select-none pointer-events-none">
              <span className="text-5xl sm:text-6xl drop-shadow-xl animate-bounce">🦆</span>
              <span className="text-3xl text-yellow-300 -ml-3 -mt-6 animate-pulse">✨</span>
            </div>

            <div>
              <span className="inline-block text-xs font-mono font-black uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                FEATURED HUB
              </span>
              <h2 className="text-5xl sm:text-7xl font-black tracking-tight leading-[0.88] text-black select-none">
                plastic<br />
                matters
              </h2>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOrder(serviceOne)}
                className="inline-flex items-center gap-2 rounded-full bg-black text-white px-7 py-3.5 font-black text-sm tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:bg-neutral-900 transition hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>اطلب الخدمة الآن</span>
                <span className="text-xs text-[#CCFF00] font-normal">/ Instant Order</span>
                <ArrowUpRight size={18} className="text-[#CCFF00]" />
              </button>

              {onOpenPromoVideo && (
                <button
                  onClick={onOpenPromoVideo}
                  className="inline-flex items-center gap-2 rounded-full bg-[#CCFF00] text-black px-6 py-3.5 font-black text-sm border-2 border-black shadow-[4px_4px_0px_0px_black] hover:bg-[#b8e600] transition active:scale-95"
                >
                  <Video size={17} />
                  <span>فيديو ترويجي ودليل الموقع 🎬</span>
                </button>
              )}

              {!user && onStartGoogleLogin && (
                <button
                  onClick={onStartGoogleLogin}
                  className="rounded-full bg-white text-black px-6 py-3.5 font-black text-sm border-2 border-black shadow-[4px_4px_0px_0px_black] hover:bg-neutral-100 transition"
                >
                  تسجيل Google
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MIDDLE BANNER RIBBON (MORE ★ OR @ LESS)
          ========================================================================= */}
      <div className="w-full rounded-[24px] bg-[#CCFF00] text-black py-4 px-6 border-2 border-black shadow-[6px_6px_0px_0px_#000000] overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between gap-6 whitespace-nowrap min-w-max">
          <div className="font-mono text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-3">
            <span className="text-pink-600 text-2xl">👾</span>
            <span>MORE</span>
            <span className="text-purple-700 text-2xl">★</span>
            <span>OR</span>
            <span className="bg-black text-[#CCFF00] px-2 py-0.5 rounded-md">@</span>
            <span>LESS</span>
          </div>

          <div className="h-6 w-[2px] bg-black/20" />

          <div className="font-mono text-sm sm:text-base font-black tracking-wider flex items-center gap-4">
            <span className="text-black">⚡ 100% VERIFIED SERVICES</span>
            <span className="text-purple-800">✦</span>
            <span className="text-black">PAYONEER + OKX USDT TRC20</span>
            <span className="text-pink-600">🌸</span>
            <span className="text-black">DIRECT TELEGRAM DISPATCH</span>
            <span className="text-purple-800">✦</span>
            <span className="bg-black text-[#CCFF00] px-2.5 py-0.5 rounded-full text-xs font-mono">2026 EDITION</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM BENTO GRID BLOCK (Direct match with Bottom Composite in Screenshot)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Card 6: Vibrant Red/Orange Card with Exploding White Starburst & Service 1 (5 cols) */}
        <div className="md:col-span-5 rounded-[32px] bg-[#FF3B00] text-white p-6 sm:p-7 border-2 border-black shadow-[6px_6px_0px_0px_#000000] relative overflow-hidden flex flex-col justify-between min-h-[340px]">
          {/* Large radiating white starburst background */}
          <div className="absolute -left-12 -top-12 text-white/95 pointer-events-none select-none z-0">
            <StarburstSvg className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-sm" />
          </div>

          {/* Green pixel squiggles */}
          <div className="absolute right-4 top-4 text-[#CCFF00] pointer-events-none select-none z-10">
            <PixelSquiggleSvg className="w-28 h-10" />
          </div>

          {/* Service photo preview overlay with cute portrait cutout style */}
          <div className="relative z-10 flex items-start justify-between">
            <span className="inline-block font-mono text-xs font-black uppercase tracking-wider bg-black text-[#CCFF00] px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_black]">
              HOT SERVICE ★
            </span>
            <span className="text-2xl font-black text-black bg-white px-3 py-1 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_black]">
              ${serviceOne.usdPrice || "49.00"}
            </span>
          </div>

          <div className="relative z-10 my-4 flex items-center gap-4">
            <img
              src={serviceOne.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"}
              alt={serviceOne.title}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-black shadow-[4px_4px_0px_0px_black] shrink-0"
            />
            <div>
              <h4 className="text-xl sm:text-2xl font-black leading-tight text-white drop-shadow-md">
                {serviceOne.title}
              </h4>
              <p className="mt-1 text-xs text-white/90 line-clamp-2">
                {serviceOne.description}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-3 border-t-2 border-black/20">
            <button
              onClick={() => handleOrder(serviceOne)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-6 py-3.5 font-black text-sm tracking-wide shadow-[4px_4px_0px_0px_black] hover:bg-neutral-900 transition hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>اطلب فوراً عبر Payoneer / Crypto</span>
              <ArrowUpRight size={16} className="text-[#CCFF00]" />
            </button>
          </div>
        </div>

        {/* Card 7: Electric Violet/Purple Card with Pixel Zig-Zags (4 cols) */}
        <div className="md:col-span-4 rounded-[32px] bg-[#7C3AED] text-white p-6 sm:p-7 border-2 border-black shadow-[6px_6px_0px_0px_#000000] relative overflow-hidden flex flex-col justify-between min-h-[340px]">
          {/* White & Lime Pixel Zig-Zags in the background */}
          <div className="absolute top-3 left-4 text-white pointer-events-none select-none z-0">
            <PixelSquiggleSvg className="w-32 h-14" />
          </div>
          <div className="absolute bottom-16 right-4 text-[#CCFF00] pointer-events-none select-none z-0">
            <PixelSquiggleSvg className="w-32 h-14" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="font-mono text-xs font-black uppercase tracking-wider bg-black text-[#CCFF00] px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_black]">
              AUTOMATION ✦
            </span>
            <span className="text-sm font-black text-white bg-black/40 px-3 py-1 rounded-full border border-white/20">
              {serviceTwo.pointsPrice || 220} PTS
            </span>
          </div>

          <div className="relative z-10 my-4">
            <h4 className="text-2xl sm:text-3xl font-black leading-tight text-white">
              {serviceTwo.title}
            </h4>
            <p className="mt-2 text-xs text-purple-200 line-clamp-3 leading-relaxed">
              {serviceTwo.description}
            </p>
          </div>

          <div className="relative z-10 pt-3 border-t-2 border-black/20">
            <button
              onClick={() => handleOrder(serviceTwo)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-6 py-3.5 font-black text-sm tracking-wide shadow-[4px_4px_0px_0px_black] hover:bg-neutral-900 transition hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>طلب الخدمة</span>
              <span className="text-xs text-[#CCFF00] font-normal">(${serviceTwo.usdPrice || "79.00"})</span>
              <ArrowUpRight size={16} className="text-[#CCFF00]" />
            </button>
          </div>
        </div>

        {/* Right Mini-Grid Column: Starburst Heart, Hot Pink Smiley, Cyber Pill (3 cols) */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Mini Card A: Cream Card with Starburst & Black Heart */}
            <div className="rounded-[28px] bg-[#F5F5F0] text-black p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000000] flex flex-col items-center justify-center text-center aspect-square">
              <HeartStarburstSvg />
              <span className="mt-1 text-[10px] font-mono font-black uppercase tracking-wider">
                100% TRUST
              </span>
            </div>

            {/* Mini Card B: Hot Pink Square with Big Yellow Smiley Face */}
            <div className="rounded-[28px] bg-[#EC4899] text-black p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000000] flex flex-col items-center justify-center text-center aspect-square select-none">
              <span className="text-4xl drop-shadow-md animate-pulse">😊</span>
              <span className="mt-2 text-[10px] font-mono font-black uppercase tracking-wider text-black bg-[#CCFF00] px-1.5 py-0.5 rounded">
                HAPPY USERS
              </span>
            </div>
          </div>

          {/* Mini Card C: Dark Cyber Pill (DIRTYBARN KKK GRAZXA style) */}
          <div className="rounded-[28px] bg-[#0A0A0E] text-white p-5 border-2 border-black shadow-[5px_5px_0px_0px_#000000] flex flex-col justify-between flex-1 min-h-[140px]">
            <div className="text-xs font-mono text-[#EC4899] font-black tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe size={14} />
                <span>{"-->"} +++</span>
              </span>
              <span className="text-[#CCFF00] text-[10px]">VERIFIED</span>
            </div>

            <div className="my-2">
              <div className="font-mono text-sm font-black tracking-widest text-[#EC4899] uppercase">
                DIRTYBARN
              </div>
              <div className="font-mono text-xs font-black tracking-widest text-[#CCFF00]">
                KKK GRAZXA
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span>PAYONEER & USDT</span>
              <span className="text-white font-bold">YEMEN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal for immediate direct ordering */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        service={selectedService}
        checkoutData={{
          checkout_url:
            (selectedService && (selectedService as any).payoneerUrl) ||
            "https://link.payoneer.com/Token?t=09C648443DD44B91BE4267CF20C6F297&src=mobile",
          crypto_address: "TKAWh7LiJY8wEcQ9r6N9e9DasfEEXxDStu",
          crypto_network: "TRC20",
        }}
      />
    </div>
  );
};

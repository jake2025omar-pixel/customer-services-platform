import React, { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Contests from "./pages/Contests";
import RewardedAds from "./pages/RewardedAds";
import Services from "./pages/Services";
import Admin from "@/pages/Admin";
import AdminServices from "@/pages/AdminServices";
import { useAuth } from "./_core/hooks/useAuth";
import { LayoutDashboard, Trophy, Gift, Layers3, LogOut, Settings2, Sparkles, ShieldCheck, Video } from "lucide-react";
import { triggerGoogleSignIn } from "./lib/firebaseAuth";
import { GoogleAccountChooserModal } from "./components/GoogleAccountChooserModal";
import { BentoShowcase } from "./components/BentoShowcase";
import { PromoVideoModal } from "./components/PromoVideoModal";

const navItems = [
  { href: "/", label: "تيك محلي / Tech", icon: LayoutDashboard },
  { href: "/contests", label: "المسابقات / Contests", icon: Trophy },
  { href: "/rewarded-ads", label: "المكافآت والإعلانات / Ads", icon: Gift },
  { href: "/services", label: "سيول / Services", icon: Layers3 },
];

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={`${className} shrink-0 inline-block align-middle`}
      aria-hidden="true"
    >
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
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [chooserReason, setChooserReason] = useState<string | undefined>(undefined);
  const [isPromoVideoOpen, setIsPromoVideoOpen] = useState(false);

  const handleGoogleLogin = () => {
    triggerGoogleSignIn((reason) => {
      setChooserReason(reason);
      setIsChooserOpen(true);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#080A0F] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#BEF264] border-t-transparent" />
          <p className="text-sm font-semibold text-[#8B8FA3]">جاري تهيئة مساحة العمل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b-2 border-black bg-black/90 px-5 py-4 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#CCFF00] text-black font-black shadow-[4px_4px_0px_0px_white]">
                <Sparkles size={20} />
              </span>
              <span>
                <span className="block text-sm font-black font-mono tracking-[0.2em] text-[#CCFF00]">
                  CUSTOMER
                </span>
                <span className="block text-xs font-bold tracking-[0.3em] text-neutral-400">
                  SERVICES
                </span>
              </span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsPromoVideoOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#CCFF00] bg-[#12141D] px-4 py-2.5 text-xs font-black text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition shadow-[3px_3px_0px_0px_white] active:translate-y-0.5"
                title="مشاهدة الفيديو الترويجي ودليل استخدام المنصة"
              >
                <Video size={15} />
                <span>فيديو ترويجي 🎬</span>
              </button>

              <button
                onClick={() => navigate("/services")}
                className="hidden md:inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-[#12141D] px-5 py-2.5 text-xs font-black text-white hover:border-[#CCFF00] transition"
              >
                استعراض الخدمات / Catalog
              </button>

              <button
                onClick={handleGoogleLogin}
                className="flex items-center gap-2.5 rounded-full bg-[#CCFF00] text-black px-5 sm:px-6 py-2.5 text-sm font-black shadow-[4px_4px_0px_0px_white] hover:bg-[#b8e600] transition active:translate-y-0.5"
              >
                <GoogleIcon className="h-4 w-4" />
                <span>ابدأ بجوجل</span>
                <span className="hidden sm:inline text-xs font-normal opacity-85">/ Continue with Google</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Banner & Bento Grid Showcase */}
        <main className="mx-auto max-w-7xl px-5 py-8 pb-24 sm:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-2 border-black/40 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#CCFF00] text-black px-3.5 py-1 text-xs font-black font-mono uppercase tracking-wider mb-3 shadow-[2px_2px_0px_0px_white]">
                <span>✦</span> 100% VERIFIED POP BENTO STORE
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
                BENTO GRID <span className="text-[#CCFF00]">SERVICES.</span>
              </h1>
            </div>
            <div className="max-w-md">
              <p className="text-xs sm:text-sm font-mono text-neutral-400 leading-relaxed">
                منصة رقمية متكاملة تدعم Payoneer و محفظة OKX USDT TRC20 في اليمن والعالم، مع تسليم فوري وتوثيق مباشر على التيليجرام.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#CCFF00]">
                <ShieldCheck size={16} />
                <span>تسجيل دخول سريع وآمن بحساب Google الشخصي أو حساب الإدارة.</span>
              </div>
            </div>
          </div>

          <BentoShowcase
            onStartGoogleLogin={handleGoogleLogin}
            onOpenPromoVideo={() => setIsPromoVideoOpen(true)}
          />
        </main>

        <GoogleAccountChooserModal
          isOpen={isChooserOpen}
          onClose={() => setIsChooserOpen(false)}
          reason={chooserReason}
        />

        <PromoVideoModal
          isOpen={isPromoVideoOpen}
          onClose={() => setIsPromoVideoOpen(false)}
          onNavigateSection={(href) => navigate(href)}
          onStartGoogleLogin={handleGoogleLogin}
        />
      </div>
    );
  }

  const visibleNavItems =
    user?.role === "admin"
      ? [...navItems, { href: "/admin/services", label: "إدارة الخدمات / Admin", icon: Settings2 }]
      : navItems;
  const current = visibleNavItems.find((item) => item.href === location);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r-2 border-black bg-[#0C0D14] px-4 py-6 lg:block shadow-[5px_0px_0px_0px_black]">
        <button onClick={() => navigate("/")} className="mb-10 flex w-full items-center gap-3 px-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#CCFF00] text-black shadow-[3px_3px_0px_0px_black]">
            <Sparkles size={18} />
          </span>
          <span>
            <span className="block text-xs font-black tracking-[0.2em] text-[#CCFF00]">CUSTOMER</span>
            <span className="block text-[10px] font-bold tracking-[0.3em] text-neutral-400">SERVICES</span>
          </span>
        </button>
        <nav className="space-y-2.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = current?.href === item.href;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200 border-2 ${
                  active
                    ? "bg-[#CCFF00] text-black border-black shadow-[4px_4px_0px_0px_black]"
                    : "border-transparent text-neutral-400 hover:bg-[#151722] hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-4 right-4">
          <div className="mb-4 rounded-2xl border-2 border-black bg-[#151722] p-4 shadow-[3px_3px_0px_0px_black]">
            <p className="font-mono text-xs text-neutral-400">المستخدم النشط</p>
            <p className="mt-1 truncate text-sm font-black text-white">
              {user?.name || user?.email || "Google member"}
            </p>
            <p className="mt-1 font-mono text-xs text-[#CCFF00] font-black">
              {user?.role === "admin" ? "مدير المنصة / ADMIN" : "عضو نشط / MEMBER"}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-neutral-400 transition hover:bg-[#151722] hover:text-white"
          >
            <LogOut size={17} />
            تسجيل الخروج / Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-black bg-black/90 px-5 py-4 backdrop-blur-md sm:px-8">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#CCFF00]">
              WORKSPACE
            </p>
            <h1 className="mt-0.5 text-xl font-black text-white">{current?.label || "Overview"}</h1>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsPromoVideoOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#CCFF00] bg-[#151722] px-3.5 py-1.5 font-mono text-xs font-black text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition shadow-[2px_2px_0px_0px_black] active:translate-y-0.5"
              title="مشاهدة الفيديو الترويجي ودليل استخدام المنصة"
            >
              <Video size={14} />
              <span>فيديو ترويجي 🎬</span>
            </button>

            <span className="hidden rounded-full border-2 border-black bg-[#151722] px-3.5 py-1.5 font-mono text-xs font-bold text-[#CCFF00] md:inline shadow-[2px_2px_0px_0px_black]">
              ● VERIFIED MEMBER
            </span>
            <button
              onClick={() => logout()}
              className="grid h-10 w-10 place-items-center rounded-xl border-2 border-black bg-[#151722] text-neutral-400 hover:text-white lg:hidden"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#CCFF00] text-black font-black text-sm border-2 border-black shadow-[3px_3px_0px_0px_black]">
              {(user?.name || "M").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-7 pb-28 sm:px-8 lg:py-10">{children}</main>
      </div>

      <nav
        className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-4 gap-1.5 rounded-2xl border-2 border-black bg-[#0C0D14]/95 p-2 shadow-[4px_4px_0px_0px_black] backdrop-blur-xl lg:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = current?.href === item.href;
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-black transition-all ${
                active
                  ? "bg-[#CCFF00] text-black border border-black shadow-[2px_2px_0px_0px_black]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Icon size={17} />
              {item.label.split("/")[0].trim()}
            </button>
          );
        })}
      </nav>

      <GoogleAccountChooserModal
        isOpen={isChooserOpen}
        onClose={() => setIsChooserOpen(false)}
        reason={chooserReason}
      />

      <PromoVideoModal
        isOpen={isPromoVideoOpen}
        onClose={() => setIsPromoVideoOpen(false)}
        onNavigateSection={(href) => navigate(href)}
        onStartGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
}

function App() {
  const routerBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router base={routerBase}>
            <Shell>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/contests" component={Contests} />
                <Route path="/rewarded-ads" component={RewardedAds} />
                <Route path="/services" component={Services} />
                <Route path="/admin/services" component={AdminServices} />
                <Route path="/admin" component={Admin} />
                <Route component={NotFound} />
              </Switch>
            </Shell>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

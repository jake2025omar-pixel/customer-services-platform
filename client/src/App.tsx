import React, { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Contests from "./pages/Contests";
import RewardedAds from "./pages/RewardedAds";
import Services from "./pages/Services";
import Admin from "@/pages/Admin";
import AdminServices from "@/pages/AdminServices";
import { useAuth } from "./_core/hooks/useAuth";
import { LayoutDashboard, Trophy, Gift, Layers3, LogOut, Settings2, Sparkles, ShieldCheck } from "lucide-react";
import { triggerGoogleSignIn } from "./lib/firebaseAuth";
import { GoogleAccountChooserModal } from "./components/GoogleAccountChooserModal";

const navItems = [
  { href: "/", label: "نظرة عامة / Overview", icon: LayoutDashboard },
  { href: "/contests", label: "المسابقات / Contests", icon: Trophy },
  { href: "/rewarded-ads", label: "المكافآت والإعلانات / Ads", icon: Gift },
  { href: "/services", label: "الخدمات / Services", icon: Layers3 },
];

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
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

  const handleGoogleLogin = () => {
    triggerGoogleSignIn((reason) => {
      setChooserReason(reason);
      setIsChooserOpen(true);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#08101c] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
          <p className="text-sm font-semibold">جاري تهيئة مساحة العمل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#08101c] text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(60,220,184,0.16),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(101,92,255,0.18),transparent_28%)]" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-300 text-[#07131d] shadow-[0_0_28px_rgba(110,231,183,0.35)]">
              <Sparkles size={20} />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[0.2em] text-emerald-200">CUSTOMER</span>
              <span className="block text-xs font-semibold tracking-[0.32em] text-slate-400">SERVICES</span>
            </span>
          </button>

          {/* Header Login Button: "تابع مع قوقل" */}
          <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-white/15 hover:border-emerald-300/40"
          >
            <GoogleIcon className="h-4 w-4" />
            <span>تابع مع قوقل</span>
            <span className="text-xs text-slate-400 font-normal">/ Continue with Google</span>
          </button>
        </header>

        <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-20">
          <section>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> Digital services, rewards, and support
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl">
              منصتك المتكاملة للخدمات الرقمية و<span className="text-emerald-300">المكافآت الحقيقية.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              تمتع بخدمات رقمية موثوقة مع دعم كامل لطرق الدفع في اليمن والعالم (Payoneer & USDT TRC20)، بالإضافة إلى كسب النقاط المعتمدة من مشاهدة الإعلانات.
            </p>

            {/* Main Action Buttons including "ابدأ بجوجل" */}
            <div className="mt-9 flex flex-wrap gap-4">
              <button
                onClick={handleGoogleLogin}
                className="flex items-center gap-3 rounded-2xl bg-emerald-300 px-7 py-3.5 font-bold text-[#06131c] shadow-[0_12px_30px_rgba(110,231,183,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                <GoogleIcon className="h-5 w-5" />
                <span>ابدأ بجوجل</span>
                <span className="text-xs font-medium text-[#071a17]">/ Start with Google</span>
              </button>

              <button
                onClick={() => navigate("/services")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
              >
                استعراض الخدمات المتاحة
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-emerald-300" />
              <span>تسجيل دخول آمن وفوري بحساب Google الشخصي أو حساب الإدارة.</span>
            </div>
          </section>

          <section className="relative rounded-[32px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-300/15 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  حالة المنصة والنظام
                </span>
                <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
                  نشطة 100%
                </span>
              </div>
              <div className="mt-8 rounded-3xl bg-[#0d1a2a] p-5">
                <p className="text-sm text-slate-400">بوابة الخدمات المعتمدة</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Payoneer + OKX USDT نشط
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
                    <p className="text-xs text-slate-500">الخدمات النشطة</p>
                    <p className="mt-2 text-2xl font-semibold text-white">09</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
                    <p className="text-xs text-slate-500">حملات الجوائز</p>
                    <p className="mt-2 text-2xl font-semibold text-white">02</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-emerald-300/10 p-4">
                  <p className="text-xs text-emerald-100/70">أمان فائق</p>
                  <p className="mt-1 font-semibold text-emerald-100">تحقق عبر السيرفر</p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">إعلانات HilltopAds</p>
                  <p className="mt-1 font-semibold text-white">+5 نقاط معتمدة</p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">دعم اليمن</p>
                  <p className="mt-1 font-semibold text-white">تحويل بنكي مباشر</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <GoogleAccountChooserModal
          isOpen={isChooserOpen}
          onClose={() => setIsChooserOpen(false)}
          reason={chooserReason}
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
    <div className="min-h-screen bg-[#08101c] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[0.07] bg-[#0a1523]/90 px-4 py-6 backdrop-blur-xl lg:block">
        <button onClick={() => navigate("/")} className="mb-10 flex w-full items-center gap-3 px-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300 text-[#07131d]">
            <Sparkles size={18} />
          </span>
          <span>
            <span className="block text-xs font-bold tracking-[0.2em] text-emerald-200">CUSTOMER</span>
            <span className="block text-[10px] font-semibold tracking-[0.3em] text-slate-400">SERVICES</span>
          </span>
        </button>
        <nav className="space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = current?.href === item.href;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-300 text-[#07131d] shadow-[0_10px_24px_rgba(110,231,183,0.12)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-4 right-4">
          <div className="mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-slate-500">تم تسجيل الدخول بواسطة</p>
            <p className="mt-1 truncate text-sm font-semibold text-white">
              {user?.name || user?.email || "Google member"}
            </p>
            <p className="mt-1 text-xs text-emerald-200">
              {user?.role === "admin" ? "مدير المنصة (Administrator)" : "عضو نشط (Member)"}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} />
            تسجيل الخروج / Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.07] bg-[#08101c]/85 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Workspace</p>
            <h1 className="mt-1 text-xl font-semibold text-white">{current?.label || "Overview"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400 sm:inline">
              Secure member area
            </span>
            <button
              onClick={() => logout()}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/15 text-sm font-bold text-emerald-200">
              {(user?.name || "M").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-7 pb-28 sm:px-8 lg:py-10">{children}</main>
      </div>

      <nav
        className={`fixed bottom-3 left-3 right-3 z-30 grid gap-1 rounded-2xl border border-white/10 bg-[#0d1a2a]/95 p-2 shadow-2xl backdrop-blur-xl lg:hidden ${
          user?.role === "admin" ? "grid-cols-5" : "grid-cols-4"
        }`}
      >
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = current?.href === item.href;
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold ${
                active ? "bg-emerald-300 text-[#07131d]" : "text-slate-500"
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
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

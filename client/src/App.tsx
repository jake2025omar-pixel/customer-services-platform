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
import Admin from "./pages/Admin";
import { useAuth } from "./_core/hooks/useAuth";
import { startLogin } from "./const";
import { LayoutDashboard, Trophy, Gift, Layers3, ShieldCheck, LogOut, Sparkles } from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/contests", label: "Contests", icon: Trophy },
  { href: "/rewarded-ads", label: "Rewarded Ads", icon: Gift },
  { href: "/services", label: "Services", icon: Layers3 },
];

function Shell({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#08101c] text-slate-300">Loading your workspace...</div>;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#08101c] text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(60,220,184,0.16),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(101,92,255,0.18),transparent_28%)]" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-300 text-[#07131d] shadow-[0_0_28px_rgba(110,231,183,0.35)]"><Sparkles size={20} /></span>
            <span><span className="block text-sm font-bold tracking-[0.2em] text-emerald-200">CUSTOMER</span><span className="block text-xs font-semibold tracking-[0.32em] text-slate-400">SERVICES</span></span>
          </button>
          <button onClick={() => startLogin()} className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Continue with Google</button>
        </header>
        <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-20">
          <section>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Digital services, rewards, and support</div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-white sm:text-7xl">A smarter home for your <span className="text-emerald-300">digital next step.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">Access practical digital services, optional rewards, contests, and a points balance designed to help you unlock benefits inside the platform.</p>
            <div className="mt-9 flex flex-wrap gap-3"><button onClick={() => startLogin()} className="rounded-2xl bg-emerald-300 px-6 py-3.5 font-bold text-[#06131c] shadow-[0_12px_30px_rgba(110,231,183,0.16)] transition hover:-translate-y-0.5">Start with Google</button><button onClick={() => navigate("/services")} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">Explore services</button></div>
            <p className="mt-6 text-xs text-slate-500">Points are platform credits, not cash, and are only used for eligible services and benefits.</p>
          </section>
          <section className="relative rounded-[32px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl sm:p-7"><div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-300/15 blur-3xl" /><div className="relative"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Platform snapshot</span><span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">Live workspace</span></div><div className="mt-8 rounded-3xl bg-[#0d1a2a] p-5"><p className="text-sm text-slate-400">Digital services hub</p><p className="mt-3 text-4xl font-semibold tracking-tight text-white">One place. Clear next steps.</p><div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Services</p><p className="mt-2 text-2xl font-semibold text-white">09</p></div><div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Active campaigns</p><p className="mt-2 text-2xl font-semibold text-white">02</p></div></div></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-emerald-300/10 p-4"><p className="text-xs text-emerald-100/70">Secure</p><p className="mt-1 font-semibold text-emerald-100">Verified events</p></div><div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Optional</p><p className="mt-1 font-semibold text-white">Rewarded ads</p></div><div className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Fair</p><p className="mt-1 font-semibold text-white">Clear rules</p></div></div></div></section>
        </main>
      </div>
    );
  }

  const current = navItems.find(item => item.href === location);
  return (
    <div className="min-h-screen bg-[#08101c] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[0.07] bg-[#0a1523]/90 px-4 py-6 backdrop-blur-xl lg:block">
        <button onClick={() => navigate("/")} className="mb-10 flex w-full items-center gap-3 px-3 text-left"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300 text-[#07131d]"><Sparkles size={18} /></span><span><span className="block text-xs font-bold tracking-[0.2em] text-emerald-200">CUSTOMER</span><span className="block text-[10px] font-semibold tracking-[0.3em] text-slate-400">SERVICES</span></span></button>
        <nav className="space-y-2">{navItems.map(item => { const Icon = item.icon; const active = current?.href === item.href; return <button key={item.href} onClick={() => navigate(item.href)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-emerald-300 text-[#07131d] shadow-[0_10px_24px_rgba(110,231,183,0.12)]" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={18} />{item.label}</button>; })}</nav>
        <div className="absolute bottom-6 left-4 right-4"><div className="mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"><p className="text-xs text-slate-500">Signed in as</p><p className="mt-1 truncate text-sm font-semibold text-white">{user?.name || user?.email || "Google member"}</p><p className="mt-1 text-xs text-emerald-200">{user?.role === "admin" ? "Administrator" : "Active member"}</p></div><button onClick={() => logout()} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-white/5 hover:text-white"><LogOut size={17} />Sign out</button></div>
      </aside>
      <div className="lg:pl-64"><header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.07] bg-[#08101c]/85 px-5 py-4 backdrop-blur-xl sm:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Workspace</p><h1 className="mt-1 text-xl font-semibold text-white">{current?.label || "Overview"}</h1></div><div className="flex items-center gap-3"><span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400 sm:inline">Secure member area</span><button onClick={() => logout()} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Sign out"><LogOut size={17} /></button><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/15 text-sm font-bold text-emerald-200">{(user?.name || "M").slice(0, 1).toUpperCase()}</div></div></header><main className="mx-auto max-w-7xl px-5 py-7 pb-28 sm:px-8 lg:py-10">{children}</main></div>
      <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-4 gap-1 rounded-2xl border border-white/10 bg-[#0d1a2a]/95 p-2 shadow-2xl backdrop-blur-xl lg:hidden">{navItems.map(item => { const Icon = item.icon; const active = current?.href === item.href; return <button key={item.href} onClick={() => navigate(item.href)} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold ${active ? "bg-emerald-300 text-[#07131d]" : "text-slate-500"}`}><Icon size={17} />{item.label}</button>; })}</nav>
    </div>
  );
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Shell><Switch><Route path="/" component={Home} /><Route path="/contests" component={Contests} /><Route path="/rewarded-ads" component={RewardedAds} /><Route path="/services" component={Services} /><Route path="/admin" component={Admin} /><Route component={NotFound} /></Switch></Shell></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;

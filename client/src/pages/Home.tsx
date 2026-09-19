import React from "react";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, Clock3, Gift, Ticket, WalletCards, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { BentoShowcase } from "@/components/BentoShowcase";

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function Home() {
  const { data, isLoading } = trpc.platform.dashboard.useQuery(undefined, {
    retry: false,
  });

  let storedPoints = 0;
  try {
    const raw = localStorage.getItem("gh_pages_user");
    if (raw) storedPoints = JSON.parse(raw).pointsBalance ?? 0;
  } catch {}

  const dashboard = data || {
    points: storedPoints || 100,
    tickets: 0,
    rewards: 0,
    orders: 0,
    accountStatus: "Active",
    recentActivity: [],
    sessions: 0,
    serviceCount: 4,
    activeCampaignCount: 2,
  };

  if (data?.points !== undefined) {
    dashboard.points = data.points;
  } else if (storedPoints) {
    dashboard.points = storedPoints;
  }

  if (isLoading && !storedPoints) {
    return (
      <div className="grid min-h-[50vh] place-items-center bg-black text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#CCFF00] border-t-transparent" />
          <p className="font-mono text-xs uppercase tracking-widest text-[#CCFF00]">
            LOADING BENTO TEMPLATES...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 selection:bg-white selection:text-black">
      {/* =========================================================
          THE FULL Y2K NEO-BRUTALIST BENTO GRID SHOWCASE
          Direct replication of the user's uploaded screenshot
          ========================================================= */}
      <BentoShowcase pointsBalance={dashboard.points} />

      {/* =========================================================
          LIVE MEMBER METRICS (4 Bento Metric Cards with Pop Shadows)
          ========================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#CCFF00] animate-pulse" />
            <h3 className="font-mono text-sm font-black uppercase tracking-wider text-white">
              [ LIVE MEMBER METRICS ]
            </h3>
          </div>
          <span className="font-mono text-xs text-neutral-400">100% SERVER VERIFIED</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Points Balance",
              sub: "رصيد النقاط",
              value: `${dashboard.points} PTS`,
              icon: WalletCards,
              bg: "bg-[#CCFF00] text-black",
              accent: "bg-black text-[#CCFF00]",
            },
            {
              label: "Campaign Tickets",
              sub: "تذاكر السحوبات",
              value: `${dashboard.tickets} TIX`,
              icon: Ticket,
              bg: "bg-[#7C3AED] text-white",
              accent: "bg-black text-[#CCFF00]",
            },
            {
              label: "Verified Rewards",
              sub: "مكافآت الإعلانات",
              value: dashboard.rewards,
              icon: Gift,
              bg: "bg-[#0066FF] text-white",
              accent: "bg-black text-white",
            },
            {
              label: "Orders Dispatched",
              sub: "الطلبات المنجزة",
              value: dashboard.orders,
              icon: Clock3,
              bg: "bg-[#FF3B00] text-white",
              accent: "bg-black text-[#CCFF00]",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`rounded-[28px] ${item.bg} p-6 border-2 border-black shadow-[5px_5px_0px_0px_#000000] flex flex-col justify-between transition-transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase tracking-wider opacity-80">
                    {item.label}
                  </span>
                  <div className={`grid h-10 w-10 place-items-center rounded-2xl ${item.accent} border border-black shadow-[2px_2px_0px_0px_black]`}>
                    <Icon size={18} />
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-3xl sm:text-4xl font-black tracking-tight">{item.value}</p>
                  <p className="mt-1 text-xs font-bold opacity-75">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          LEDGER & LIVE CATALOG ROW
          ========================================================= */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Points Ledger Box */}
        <div className="rounded-[32px] border-2 border-black bg-[#0C0D14] p-6 sm:p-7 shadow-[6px_6px_0px_0px_#000000]">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="font-mono text-xs font-black uppercase tracking-widest text-[#CCFF00]">
                RECENT ACTIVITY
              </span>
              <h4 className="mt-1 text-xl font-black text-white">سجل النقاط والعمليات</h4>
            </div>
            <span className="rounded-full bg-black border border-[#CCFF00]/40 px-3 py-1 font-mono text-xs font-bold text-[#CCFF00]">
              LIVE LOG
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.recentActivity.length ? (
              dashboard.recentActivity.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border-2 border-black bg-[#141622] px-4 py-3.5 shadow-[3px_3px_0px_0px_black]"
                >
                  <div>
                    <p className="text-sm font-black text-white">{item.description}</p>
                    <p className="mt-0.5 font-mono text-xs text-neutral-400">
                      {formatDate(item.createdAt)} {"·"} {item.type}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-sm font-black px-2.5 py-1 rounded-full border border-black ${
                      item.amount >= 0 ? "bg-[#CCFF00] text-black" : "bg-[#EC4899] text-white"
                    }`}
                  >
                    {item.amount >= 0 ? "+" : ""}
                    {item.amount} PTS
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center font-mono text-xs text-neutral-400">
                لا توجد عمليات مسجلة حالياً. سيتم تسجيل النقاط فور إتمام الخدمات أو مشاهدة الإعلانات.
              </div>
            )}
          </div>
        </div>

        {/* Quick Next Best Action Box */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[32px] border-2 border-black bg-[#CCFF00] p-6 sm:p-7 text-black shadow-[6px_6px_0px_0px_#000000] flex-1 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-black uppercase tracking-wider bg-black text-[#CCFF00] px-3 py-1 rounded-full">
                BONUS REWARDS 🌸
              </span>
              <h4 className="mt-3 text-2xl sm:text-3xl font-black leading-tight text-black">
                احصل على +5 نقاط معتمدة من مشاهدة الإعلانات
              </h4>
              <p className="mt-3 text-xs sm:text-sm font-bold text-neutral-800 leading-relaxed">
                مشاهدة الإعلانات اختيارية بالكامل. يتم احتساب النقاط فورا وبشكل موثوق من خلال خوادم HilltopAds.
              </p>
            </div>

            <Link
              href="/rewarded-ads"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-6 py-3.5 font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:bg-neutral-900 transition hover:-translate-y-0.5"
            >
              <span>فتح مركز الإعلانات والمكافآت</span>
              <ArrowUpRight size={16} className="text-[#CCFF00]" />
            </Link>
          </div>

          <div className="rounded-[32px] border-2 border-black bg-[#0C0D14] p-6 text-white shadow-[6px_6px_0px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black uppercase text-[#CCFF00]">
                PAYMENT METHODS
              </span>
              <span className="font-mono text-xs text-neutral-400">YEMEN & GLOBAL</span>
            </div>
            <p className="mt-2 text-sm font-bold text-white">
              دعم فوري ومباشر لـ Payoneer ومحفظة OKX USDT (شبكة TRC20).
            </p>
            <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs">
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-white border border-white/20">
                ✓ Payoneer Direct
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-white border border-white/20">
                ✓ OKX USDT TRC20
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-white border border-white/20">
                ✓ Telegram Dispatch
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

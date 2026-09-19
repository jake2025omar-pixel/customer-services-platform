import { trpc } from "@/lib/trpc";
import { Activity, Database, LockKeyhole, RadioTower, ShieldAlert, Sparkles, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Admin() {
  const [, navigate] = useLocation();
  const { data } = trpc.platform.adminOverview.useQuery(undefined, { retry: false });

  return (
    <div className="space-y-8" dir="rtl">
      <section className="text-right">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">لوحة الإدارة والمراقبة</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">لوحة التحكم الإدارية</h2>
        <p className="mt-3 max-w-2xl text-slate-400">متابعة العمليات، جلسات المكافآت، كتالوج الخدمات والمسابقات مع إدارة آمنة ومباشرة في Firestore.</p>
      </section>

      {/* Quick link to Services Management */}
      <div className="rounded-[28px] border border-emerald-400/20 bg-gradient-to-r from-emerald-400/10 via-emerald-400/5 to-transparent p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-300 text-[#07131d]">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">إدارة كتالوج الخدمات الرقمية (Bento Grid)</h3>
            <p className="text-xs text-slate-400 mt-1">
              إضافة وتعديل وحذف الخدمات مباشرة من Firebase Firestore بدون خادم، مع دعم كامل للصور وأسعار Payoneer و OKX USDT.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/admin/services")}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-xs font-extrabold text-[#07131d] shadow-lg transition hover:bg-emerald-300 shrink-0"
        >
          <span>فتح إدارة الخدمات</span>
          <ArrowLeft size={16} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Verified rewards", value: data?.rewards ?? 0, icon: Activity },
          { label: "Reward sessions", value: data?.sessions ?? 0, icon: RadioTower },
          { label: "Ledger entries", value: "Server", icon: Database },
          { label: "Security posture", value: "Active", icon: LockKeyhole },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-5">
              <Icon className="text-violet-200" size={19} />
              <p className="mt-5 text-sm text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-emerald-200" size={19} />
            <h3 className="font-semibold text-white">Security controls</h3>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-slate-400">
            <li>• Webhook HMAC verification with timestamp freshness</li>
            <li>• Unique provider transaction IDs and replay protection</li>
            <li>• Server-owned points ledger and role authorization</li>
            <li>• Rate limiting for reward session creation</li>
            <li>• Immutable audit events for reward actions</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6">
          <h3 className="font-semibold text-white">Launch checklist</h3>
          <div className="mt-5 space-y-3 text-sm text-slate-400">
            <p>Connect a real rewarded ad provider adapter.</p>
            <p>Store provider credentials in the deployment secret manager.</p>
            <p>Confirm local advertising, privacy, and contest requirements.</p>
            <p>Keep payments disabled until a verified provider flow is approved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


import { openPayoneerCheckout } from "../../../services/payment_service.js";
import { ArrowUpRight, Boxes, CircleAlert, Loader2, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

type Service = { id: string; title: string; description: string; imageUrl: string; pointsPrice: number | null; usdPrice: string | null; category: string; stock: number; isActive: boolean };

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/services", { credentials: "include" }).then(async response => {
      if (!response.ok) throw new Error("Unable to load services");
      setServices(await response.json());
    }).catch(error => setMessage(error instanceof Error ? error.message : "Unable to load services")).finally(() => setLoading(false));
  }, []);

  async function buy(serviceId: string) {
    setMessage(null); setBusyId(serviceId);
    try {
      const response = await fetch("/api/orders/checkout", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ service_id: serviceId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payoneer checkout is unavailable");
      openPayoneerCheckout(data.checkout_url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payoneer checkout is unavailable");
    } finally { setBusyId(null); }
  }

  return <div className="space-y-8"><section><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Digital services</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Available services</h2><p className="mt-3 max-w-2xl text-slate-400">Every card below is loaded from the live services database. Availability, image, stock, points, and Payoneer price are controlled by administrators.</p></section>{message && <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100"><CircleAlert size={17} />{message}</div>}{loading ? <div className="grid min-h-64 place-items-center text-slate-400"><Loader2 className="animate-spin" /></div> : services.length === 0 ? <div className="rounded-[28px] border border-dashed border-white/10 p-12 text-center"><Boxes className="mx-auto text-slate-600" size={32} /><h3 className="mt-4 text-lg font-semibold text-white">No active services yet</h3><p className="mt-2 text-sm text-slate-500">An administrator must publish a real service before it appears here.</p></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{services.map(service => <article key={service.id} className="group overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.035] transition hover:-translate-y-1 hover:border-emerald-300/20"><div className="aspect-[4/3] overflow-hidden bg-[#0d1a2a]"><img src={service.imageUrl} alt={service.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /></div><div className="p-6"><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">{service.category}</span><h3 className="mt-4 text-xl font-semibold text-white">{service.title}</h3></div><ArrowUpRight className="shrink-0 text-slate-600 group-hover:text-emerald-200" size={19} /></div><p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">{service.description}</p><div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4 text-sm"><div><p className="text-xs text-slate-500">Points</p><p className="mt-1 font-bold text-emerald-200">{service.pointsPrice === null ? "Not available" : `${service.pointsPrice} pts`}</p></div><div><p className="text-xs text-slate-500">Direct price</p><p className="mt-1 font-bold text-white">{service.usdPrice === null ? "Not available" : `$${service.usdPrice}`}</p></div></div><div className="mt-4 flex items-center justify-between"><span className={`text-xs font-semibold ${service.stock > 0 ? "text-slate-500" : "text-rose-200"}`}>{service.stock > 0 ? `${service.stock} in stock` : "Out of stock"}</span><button disabled={service.stock <= 0 || busyId === service.id} onClick={() => buy(service.id)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-3.5 py-2 text-xs font-bold text-[#07131d] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">{busyId === service.id ? <Loader2 className="animate-spin" size={14} /> : <ShoppingCart size={14} />}Buy with Payoneer</button></div></div></article>)}</div>}<div className="rounded-3xl border border-violet-300/15 bg-violet-300/[0.05] p-6"><p className="text-sm font-semibold text-violet-100">Payments are provider-verified</p><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">The checkout button only opens a Payoneer URL supplied by the server. An order is created and sent to Telegram only after a signed payment confirmation is received.</p></div></div>;
}

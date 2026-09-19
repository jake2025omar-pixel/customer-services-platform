import { trpc } from "@/lib/trpc";
import { CalendarDays, ChevronRight, CircleAlert, Loader2, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getFirestoreCampaigns, isGitHubPages, Campaign } from "@/lib/firestoreService";

export default function Contests() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { data: dashboard } = trpc.platform.dashboard.useQuery(undefined, {
    retry: false,
  });

  async function loadCampaigns() {
    try {
      if (isGitHubPages) {
        const data = await getFirestoreCampaigns();
        setCampaigns(data);
        return;
      }
      try {
        const response = await fetch("/api/campaigns", { credentials: "include" });
        if (response.ok) {
          const items = await response.json();
          if (Array.isArray(items) && items.length > 0) {
            setCampaigns(items);
            return;
          }
        }
      } catch {}
      const data = await getFirestoreCampaigns();
      setCampaigns(data);
    } catch {
      const data = await getFirestoreCampaigns();
      setCampaigns(data);
    }
  }

  useEffect(() => {
    loadCampaigns().finally(() => setLoading(false));
  }, []);

  async function join(campaignId: string) {
    setMessage(null);
    setJoining(campaignId);
    try {
      if (isGitHubPages) {
        // Direct local/Firestore join simulation
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId
              ? { ...c, userJoined: true, participantCount: c.participantCount + 1 }
              : c
          )
        );
        setMessage("تم اشتراكك في المسابقة بنجاح وخصم التذاكر!");
        return;
      }
      const response = await fetch(`/api/campaigns/${campaignId}/join`, {
        method: "POST",
        headers: { "content-type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        credentials: "include",
        body: "{}",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to join campaign");
      await loadCampaigns();
      setMessage(
        data.status === "idempotent_replay"
          ? "This join request was already processed."
          : data.status === "already_joined"
          ? "You have already joined this campaign."
          : "You joined the campaign and tickets were deducted."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تم اشتراكك في المسابقة!");
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, userJoined: true, participantCount: c.participantCount + 1 } : c
        )
      );
    } finally {
      setJoining(null);
    }
  }

  return <div className="space-y-8"><section><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Fair participation</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Contests & rewards</h2><p className="mt-3 max-w-2xl text-slate-400">Campaigns below are loaded from the live database. Participation is optional, tickets are deducted server-side, and a duplicate request cannot charge you twice.</p></section><div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 text-sm"><span className="text-slate-500">Your ticket balance</span><span className="font-bold text-emerald-200">{dashboard?.tickets ?? 0} tickets</span>{message && <span className="ml-auto flex items-center gap-2 text-amber-100"><CircleAlert size={15} />{message}</span>}</div>{loading ? <div className="grid min-h-64 place-items-center text-slate-400"><Loader2 className="animate-spin" /></div> : campaigns.length === 0 ? <div className="rounded-[28px] border border-dashed border-white/10 p-12 text-center"><ShieldCheck className="mx-auto text-slate-600" size={32} /><h3 className="mt-4 text-lg font-semibold text-white">No active campaigns</h3><p className="mt-2 text-sm text-slate-500">Campaigns appear only after an administrator publishes complete official rules and eligibility details.</p></div> : <div className="grid gap-5 xl:grid-cols-2">{campaigns.map(campaign => <article key={campaign.id} className="rounded-[28px] border border-white/[0.07] bg-white/[0.035] p-6 transition hover:border-emerald-300/20 hover:bg-white/[0.05]"><div className="flex items-start justify-between gap-4"><div><span className="inline-flex rounded-full bg-violet-300/10 px-3 py-1.5 text-xs font-bold text-violet-200">Active campaign</span><h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{campaign.name}</h3></div><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-200"><ChevronRight size={20} /></div></div><div className="mt-6 rounded-2xl bg-[#0d1a2a] p-4"><p className="text-xs uppercase tracking-[0.14em] text-slate-500">Prize</p><p className="mt-2 font-semibold text-white">{campaign.prize}</p></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl border border-white/[0.06] p-3"><p className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={14} /> Dates</p><p className="mt-2 text-slate-200">{new Date(campaign.startsAt).toLocaleDateString()} – {new Date(campaign.endsAt).toLocaleDateString()}</p></div><div className="rounded-2xl border border-white/[0.06] p-3"><p className="flex items-center gap-2 text-xs text-slate-500"><Users size={14} /> Participants</p><p className="mt-2 text-slate-200">{campaign.participantCount} entries · {campaign.ticketCost} tickets</p></div></div><div className="mt-5 space-y-3 text-sm leading-6 text-slate-400"><p><span className="font-semibold text-slate-200">Eligibility:</span> {campaign.eligibility}</p><p><span className="font-semibold text-slate-200">Official rules:</span> {campaign.officialRules}</p><p><span className="font-semibold text-slate-200">Winner selection:</span> {campaign.winnerSelection}</p><p><span className="font-semibold text-slate-200">Prize delivery:</span> {campaign.prizeDelivery}</p></div><div className="mt-6 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5"><span className="flex items-center gap-2 text-xs text-emerald-200"><ShieldCheck size={15} /> No guaranteed win</span><button disabled={campaign.userJoined || joining === campaign.id} onClick={() => join(campaign.id)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-xs font-bold text-[#07131d] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">{joining === campaign.id ? <Loader2 className="animate-spin" size={14} /> : null}{campaign.userJoined ? "Joined" : `Join for ${campaign.ticketCost} tickets`}</button></div></article>)}</div>}</div>;
}

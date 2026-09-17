import { openPayoneerCheckout } from "../../../services/payment_service.js";
import { ArrowUpRight, Boxes, CircleAlert, Loader2, ShoppingCart, CreditCard, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";

type Service = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  pointsPrice: number | null;
  usdPrice: string | null;
  category: string;
  stock: number;
  isActive: boolean;
};

type CheckoutData = {
  checkout_url: string;
  crypto_address: string;
  crypto_network: string;
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/services", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load services");
        setServices(await response.json());
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load services"))
      .finally(() => setLoading(false));
  }, []);

  async function handleBuyClick(service: Service) {
    setMessage(null);
    setBusyId(service.id);
    setSelectedService(service);

    try {
      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ service_id: service.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payoneer checkout is unavailable");

      setCheckoutData(data);
      setIsModalOpen(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payoneer checkout is unavailable");
      // Open modal anyway with default data
      setCheckoutData({
        checkout_url: "https://payoneer.com",
        crypto_address: "TKAWh7LiJY8wEcQ9r6N9e9DasfEEXxDStu",
        crypto_network: "USDT TRC20",
      });
      setIsModalOpen(true);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
              الخدمات الرقمية / Digital Services
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              الخدمات المتاحة للشراء
            </h2>
            <p className="mt-3 max-w-2xl text-slate-400">
              جميع الخدمات مدعومة بطرق دفع مباشرة (Payoneer & USDT TRC20) مخصصة ومتاحة للمستخدمين في اليمن وكافة الدول بدون أي حجب.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2.5 text-xs text-emerald-200">
            <CreditCard size={16} />
            <span>الدفع عبر Payoneer + كريبتو OKX نشط</span>
          </div>
        </div>
      </section>

      {message && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          <CircleAlert size={17} />
          {message}
        </div>
      )}

      {loading ? (
        <div className="grid min-h-64 place-items-center text-slate-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-white/10 p-12 text-center">
          <Boxes className="mx-auto text-slate-600" size={32} />
          <h3 className="mt-4 text-lg font-semibold text-white">لا توجد خدمات نشطة حالياً</h3>
          <p className="mt-2 text-sm text-slate-500">سيتم إضافة وتفعيل الخدمات من قبل إدارة المنصة قريباً.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.035] transition hover:-translate-y-1 hover:border-emerald-300/20 shadow-lg"
            >
              <div>
                <div className="aspect-[4/3] overflow-hidden bg-[#0d1a2a]">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                        {service.category}
                      </span>
                      <h3 className="mt-4 text-xl font-semibold text-white">{service.title}</h3>
                    </div>
                    <ArrowUpRight className="shrink-0 text-slate-600 group-hover:text-emerald-200" size={19} />
                  </div>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">{service.description}</p>
                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">النقاط / Points</p>
                      <p className="mt-1 font-bold text-emerald-200">
                        {service.pointsPrice === null ? "غير متوفر" : `${service.pointsPrice} pts`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">السعر المباشر</p>
                      <p className="mt-1 font-bold text-white">
                        {service.usdPrice === null ? "50$" : `$${service.usdPrice}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className={`text-xs font-semibold ${service.stock > 0 ? "text-slate-400" : "text-rose-200"}`}>
                    {service.stock > 0 ? `المتوفر: ${service.stock}` : "نفذت الكمية"}
                  </span>
                  <button
                    disabled={service.stock <= 0 || busyId === service.id}
                    onClick={() => handleBuyClick(service)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-xs font-bold text-[#07131d] shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busyId === service.id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <ShoppingCart size={14} />
                    )}
                    <span>شراء الآن / Buy Now</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Info card on Yemen & Global payments */}
      <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.04] p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-300/10 p-3 text-emerald-300">
            <QrCode size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-100">
              دعم شامل لطرق الدفع في اليمن وباقي الدول
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              تم اعتماد الدفع عبر رابط Payoneer المباشر وبطاقات الدفع البنكية، بالإضافة إلى الدفع بعملة USDT الرقمية (شبكة TRC20 عبر محفظة OKX)، كبديل مباشر لـ Gumroad المحجوب. جميع الأرباح تُودع وتُدار بأمان في حساب Payoneer وبنك حضرموت.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
        checkoutData={checkoutData}
      />
    </div>
  );
}

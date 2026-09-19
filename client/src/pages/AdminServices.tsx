import { useAuth } from "@/_core/hooks/useAuth";
import { CircleAlert, ImagePlus, Loader2, Pencil, Plus, Save, Trash2, X, CheckCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getFirestoreServices,
  saveFirestoreService,
  deleteFirestoreService,
  Service,
  DEFAULT_SERVICES,
} from "@/lib/firestoreService";

type FormState = {
  id?: string;
  title: string;
  description: string;
  category: string;
  points_price: string;
  usd_price: string;
  is_active: boolean;
  image_url: string;
  image_base64?: string;
  image_file?: File;
};

const blank: FormState = {
  title: "",
  description: "",
  category: "تصميم",
  points_price: "",
  usd_price: "",
  is_active: true,
  image_url: "",
};

const CATEGORIES = ["تصميم", "سوشيال ميديا", "مواقع", "أخرى"];

export default function AdminServices() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<FormState>(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    try {
      const items = await getFirestoreServices(false);
      setServices(items.length > 0 ? items : DEFAULT_SERVICES);
    } catch (error) {
      console.warn("[AdminServices] Firestore load fallback:", error);
      setServices(DEFAULT_SERVICES);
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  function edit(service: Service) {
    setForm({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category || "تصميم",
      points_price: service.pointsPrice?.toString() || "",
      usd_price: service.usdPrice || "",
      is_active: service.isActive,
      image_url: service.imageUrl,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("يرجى اختيار ملف صورة صالح");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        image_base64: String(reader.result),
        image_file: file,
        image_url: "",
      }));
    };
    reader.readAsDataURL(file);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      // Direct Firestore save
      await saveFirestoreService({
        ...form,
        stock: 999, // Automatic unlimited stock for digital services
      });

      setForm(blank);
      await load();
      setMessage("تم حفظ الخدمة بنجاح في قاعدة بيانات Firestore المباشرة.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ الخدمة");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة من قاعدة البيانات؟")) return;
    try {
      await deleteFirestoreService(id);
      await load();
      setMessage("تم حذف الخدمة بنجاح من Firestore.");
    } catch (err: any) {
      setMessage(err.message || "تعذر حذف الخدمة");
    }
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <section className="text-right">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3.5 py-1 text-xs font-bold text-violet-300">
          <Sparkles size={13} />
          <span>لوحة التحكم المباشرة / Firestore Admin</span>
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          إدارة الخدمات الرقمية
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          أضف أو عدّل الخدمات المعروضة للزبائن. جميع التغييرات تُحفظ مباشرة في Firebase Firestore وتعمل على GitHub Pages بدون أي خادم وسيط.
        </p>
      </section>

      {message && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-3.5 text-sm text-emerald-100">
          <CheckCircle size={18} className="text-emerald-300 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Simplified Service Form */}
      <form onSubmit={save} className="rounded-[32px] border border-white/10 bg-[#0d1624] p-6 sm:p-8 text-right shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">
              {form.id ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              قم بتعبئة بيانات الخدمة ليتم نشرها في شبكة Bento Grid للعملاء.
            </p>
          </div>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(blank)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              <X size={15} />
              <span>إلغاء التعديل</span>
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* 1. Service Title (Arabic) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-white">
              اسم الخدمة (عربي) <span className="text-rose-400">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="مثال: تصميم شعار احترافي"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">
              اسم الخدمة باللغة العربية كما سيظهر في كروت المتجر
            </p>
          </div>

          {/* 2. Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-white">
              الفئة (Category)
            </label>
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#070e18] px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              تصنيف الخدمة لتحديد نمط ولون الكرت في المتجر
            </p>
          </div>

          {/* 3. Short Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-semibold text-white">
              الوصف (مختصر سطرين) <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="اكتب وصفاً جذاباً ومختصراً يوضح فائدة الخدمة في سطرين..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">
              وصف جذاب ومختصر للخدمة (يظهر بسطرين في واجهة الزبون)
            </p>
          </div>

          {/* 4. Points Price */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-white">
              السعر بالنقاط (Points Price)
            </label>
            <input
              type="number"
              min="0"
              value={form.points_price}
              onChange={(event) => setForm({ ...form, points_price: event.target.value })}
              placeholder="مثال: 500"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">
              عدد النقاط المطلوبة من رصيد العميل لاستبدال الخدمة (اتركه فارغاً إذا كاش فقط)
            </p>
          </div>

          {/* 5. USD Price */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-white">
              السعر بالدولار ($ USD) <span className="text-rose-400">*</span>
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.usd_price}
              onChange={(event) => setForm({ ...form, usd_price: event.target.value })}
              placeholder="مثال: 10"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
            />
            <p className="text-[11px] text-emerald-400">
              يظهر للعميل كسعر بديل للدفع عبر Payoneer أو محفظة OKX (USDT TRC20)
            </p>
          </div>

          {/* 6. Image URL & Direct Upload */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-semibold text-white">
              رابط الصورة أو رفع صورة
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.image_url}
                onChange={(event) =>
                  setForm({ ...form, image_url: event.target.value, image_base64: undefined })
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
              />

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-400/5 px-4 py-3 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/10">
                <ImagePlus size={16} />
                <span>
                  {form.image_base64
                    ? "تم اختيار الصورة (جاهزة للحفظ)"
                    : "أو ارفع صورة مباشرة من جهازك"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImage(event.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              رابط مباشر لصورة الخدمة أو ارفع صورة مباشرة من جهازك
            </p>
          </div>

          {/* 7. Active Toggle */}
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-white">
                حالة تفعيل الخدمة (Active)
              </span>
              <p className="text-xs text-slate-400">
                عند تفعيلها تظهر الخدمة فوراً للزبائن في المتجر مع إمكانية الطلب.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-400"></div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-extrabold text-[#07131d] shadow-lg transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : form.id ? (
              <Save size={16} />
            ) : (
              <Plus size={16} />
            )}
            <span>{form.id ? "حفظ التعديلات في Firestore" : "إضافة الخدمة ونشرها"}</span>
          </button>
        </div>
      </form>

      {/* Services List in Firestore */}
      <section className="rounded-[32px] border border-white/10 bg-[#0d1624] p-6 sm:p-8 text-right">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">الخدمات المعروضة حالياً</h3>
            <p className="mt-1 text-xs text-slate-400">
              يمكنك تعديل أي خدمة أو حذفها مباشرة من Firestore
            </p>
          </div>
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-emerald-300">
            {services.length} خدمة
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">جاري تحميل الخدمات...</div>
        ) : services.length === 0 ? (
          <div className="py-12 text-center text-slate-500">لا توجد خدمات مضافة حتى الآن.</div>
        ) : (
          <div className="mt-6 space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-emerald-400/20"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={service.imageUrl}
                    alt=""
                    className="h-14 w-20 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-base">{service.title}</p>
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">
                        {service.category || "عام"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      السعر:{" "}
                      <span className="text-emerald-300 font-bold">
                        ${service.usdPrice || "10"}
                      </span>{" "}
                      {service.pointsPrice && (
                        <span>({service.pointsPrice} نقطة)</span>
                      )}{" "}
                      · الحالة:{" "}
                      <span className={service.isActive ? "text-emerald-400" : "text-amber-400"}>
                        {service.isActive ? "نشطة للزبائن" : "مخفية"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => edit(service)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
                  >
                    <Pencil size={14} />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => remove(service.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3.5 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-400/20"
                  >
                    <Trash2 size={14} />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


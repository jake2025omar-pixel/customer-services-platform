import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Trophy,
  Gift,
  Layers3,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Coins,
  Bot,
  ArrowRight,
  FileText,
  Video,
  MonitorPlay,
  ShieldCheck,
} from "lucide-react";
import storeBotImg from "@/assets/store_order_bot.jpg";

interface PromoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection?: (href: string) => void;
  onStartGoogleLogin?: () => void;
}

interface Scene {
  id: number;
  duration: number; // in seconds
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  secondaryColor: string;
  voiceText: string;
  sectionLink?: string;
  sectionLinkLabel?: string;
  renderVisual: () => React.ReactNode;
}

export function PromoVideoModal({
  isOpen,
  onClose,
  onNavigateSection,
  onStartGoogleLogin,
}: PromoVideoModalProps) {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0); // 0 to 100
  const [showScriptTab, setShowScriptTab] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Define the 7 comprehensive promotional video scenes
  const scenes: Scene[] = [
    {
      id: 1,
      duration: 11,
      title: "مرحباً بكم في منصة خدمة العملاء وسيول",
      subtitle: "بوابتك الأولى للخدمات الرقمية، المسابقات الكبرى، وربح النقاط المجانية في اليمن والعالم",
      badge: "✦ البداية / THE INTRO ✦",
      accentColor: "#CCFF00",
      secondaryColor: "#0066FF",
      voiceText:
        "أهلاً بكم في منصة خدمة العملاء وسيول الرقمية! وجهتكم المتكاملة والأولى للحصول على أرقى الخدمات البرمجية والتسويقية، المشاركة في أضخم المسابقات الدورية، وربح نقاط مجانية واستبدالها بخدمات حقيقية بدون أي تكاليف.",
      renderVisual: () => (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-5 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-[#CCFF00] border-4 border-black shadow-[6px_6px_0px_0px_black] flex items-center justify-center transform -rotate-3 transition hover:rotate-0">
              <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-black animate-pulse" />
            </div>
            <span className="absolute -bottom-2 -right-2 bg-black text-[#CCFF00] font-mono text-[11px] font-black px-3 py-1 rounded-full border border-[#CCFF00] shadow-[2px_2px_0px_0px_white]">
              2026 VERIFIED
            </span>
          </div>

          <div className="space-y-2 max-w-lg">
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              CUSTOMER SERVICES <span className="text-[#CCFF00]">× SAYOOL</span>
            </h2>
            <p className="text-xs sm:text-sm font-mono text-neutral-300">
              منظومة إلكترونية حديثة تدعم الدفع المباشر عبر Payoneer ومحفظة OKX USDT في اليمن وجميع الدول.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="rounded-full bg-black/60 border border-white/20 px-3 py-1 text-xs font-mono text-white flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#CCFF00]" /> توثيق وأمان فوري
            </span>
            <span className="rounded-full bg-black/60 border border-white/20 px-3 py-1 text-xs font-mono text-white flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-yellow-400" /> نقاط ومكافآت مجانية
            </span>
            <span className="rounded-full bg-black/60 border border-white/20 px-3 py-1 text-xs font-mono text-white flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-cyan-400" /> بوتات ذكية وتسليم سريع
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      duration: 12,
      title: "القسم الأول: «تيك محلي» (نظرة عامة)",
      subtitle: "مركز القيادة المباشر لمتابعة حسابك، رصيد النقاط، والإحصائيات الحية",
      badge: "✦ 01 / TECH OVERVIEW ✦",
      accentColor: "#0066FF",
      secondaryColor: "#CCFF00",
      sectionLink: "/",
      sectionLinkLabel: "استكشف تيك محلي",
      voiceText:
        "القسم الأول هو تيك محلي، وهو لوحة التحكم الرئيسية الخاصة بك. من خلال هذا القسم تتابع رصيد نقاطك المحدث لحظة بلحظة، إحصائيات النشاط، حالة الحساب المعتمد، والوصول الفوري لكافة أقسام الموقع بضغطة زر واحدة.",
      renderVisual: () => (
        <div className="w-full max-w-xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="rounded-2xl border-3 border-black bg-[#0066FF] p-4 sm:p-5 text-white shadow-[5px_5px_0px_0px_black]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-mono font-black">
                [ DASHBOARD OVERVIEW ]
              </span>
              <span className="text-xl">📊</span>
            </div>
            <h3 className="mt-3 text-xl sm:text-2xl font-black">
              لوحة التحكم الشاملة والرصيد المباشر
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 font-mono">
              تحديث فوري للنقاط والطلبات وسجل العمليات بدون أي انتظار.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border-2 border-black bg-[#151722] p-3 text-center shadow-[3px_3px_0px_0px_black]">
              <p className="text-[10px] font-mono text-neutral-400">رصيد النقاط</p>
              <p className="mt-1 text-base sm:text-lg font-black text-[#CCFF00]">1,250 PTS</p>
            </div>
            <div className="rounded-xl border-2 border-black bg-[#151722] p-3 text-center shadow-[3px_3px_0px_0px_black]">
              <p className="text-[10px] font-mono text-neutral-400">تذاكر المسابقة</p>
              <p className="mt-1 text-base sm:text-lg font-black text-white">25 تذكرة</p>
            </div>
            <div className="rounded-xl border-2 border-black bg-[#151722] p-3 text-center shadow-[3px_3px_0px_0px_black]">
              <p className="text-[10px] font-mono text-neutral-400">الخدمات النشطة</p>
              <p className="mt-1 text-base sm:text-lg font-black text-cyan-400">7 خدمات</p>
            </div>
            <div className="rounded-xl border-2 border-black bg-[#151722] p-3 text-center shadow-[3px_3px_0px_0px_black]">
              <p className="text-[10px] font-mono text-neutral-400">حالة الحساب</p>
              <p className="mt-1 text-base sm:text-lg font-black text-green-400">موثق 100%</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      duration: 12,
      title: "القسم الثاني: «المسابقات» (Contests)",
      subtitle: "سحوبات مشفرة وجوائز مالية كبرى تصل إلى 500$ نقداً عبر بايونير أو USDT",
      badge: "✦ 02 / CONTESTS & PRIZES ✦",
      accentColor: "#FF3B00",
      secondaryColor: "#CCFF00",
      sectionLink: "/contests",
      sectionLinkLabel: "دخول صفحة المسابقات",
      voiceText:
        "القسم الثاني هو قسم المسابقات. هنا تتاح لك فرصة ذهبية للمشاركة في مسابقات وسحوبات دورية على جوائز نقدية ضخمة مثل جائزة الـ 500 دولار نقداً. كل تذكرة سحب تحصل عليها تزيد من فرص فوزك العادل والمشفر.",
      renderVisual: () => (
        <div className="w-full max-w-xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="rounded-2xl border-3 border-black bg-[#FF3B00] p-5 text-white shadow-[5px_5px_0px_0px_black] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-mono font-black">
                🏆 الجائزة الكبرى النشطة
              </span>
              <span className="rounded-full bg-[#CCFF00] text-black px-2.5 py-0.5 font-mono text-xs font-black">
                LIVE NOW
              </span>
            </div>
            <h3 className="mt-3 text-2xl sm:text-3xl font-black">500$ نقداً (Payoneer / USDT TRC20)</h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-100 font-mono">
              سحب عشوائي ونزيه متاح للمستخدمين في اليمن وكافة دول العالم بدون أي قيود.
            </p>

            <div className="mt-4 pt-3 border-t-2 border-white/20 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1 font-bold">
                <Trophy className="h-4 w-4 text-yellow-300" /> نظام التذاكر المعتمد
              </span>
              <span className="bg-black/40 px-2 py-1 rounded">50 نقطة = تذكرة مشاركة</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      duration: 13,
      title: "القسم الثالث: «المكافآت والإعلانات» (Rewarded Ads)",
      subtitle: "منجم الذهب لجمع مئات النقاط مجاناً وبدون أي تكلفة مالية بمشاهدة الإعلانات",
      badge: "✦ 03 / REWARDED ADS ✦",
      accentColor: "#EC4899",
      secondaryColor: "#CCFF00",
      sectionLink: "/rewarded-ads",
      sectionLinkLabel: "اجمع النقاط الآن",
      voiceText:
        "القسم الثالث هو قسم المكافآت والإعلانات، وهو المكان المخصص لكسب النقاط مجاناً! لا تحتاج لدفع أي أموال؛ فقط شاهد إعلانات تفاعلية مدعومة وممتعة، واكسب فوراً 50 نقطة لكل إعلان تضاف مباشرة إلى محفظتك لتستبدلها بما تحب.",
      renderVisual: () => (
        <div className="w-full max-w-xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="rounded-2xl border-3 border-black bg-[#EC4899] p-5 text-black shadow-[5px_5px_0px_0px_black] relative">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-black text-white px-3 py-1 text-xs font-mono font-black">
                ⚡ مولّد النقاط المجانية
              </span>
              <span className="text-xl">💰</span>
            </div>
            <h3 className="mt-3 text-xl sm:text-2xl font-black">
              شاهد إعلانات قصيرة واكسب حتى 1,000+ نقطة يومياً
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-900 font-mono">
              مكافأة فورية بعد كل مشاهدة مع عداد ذكي لمنع الانتظار وضمان إيداع النقاط مباشرة.
            </p>

            <div className="mt-4 flex items-center justify-between bg-black/10 rounded-xl p-3 border border-black/20">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-black text-[#CCFF00] font-black grid place-items-center text-sm shadow-[2px_2px_0px_0px_black]">
                  +50
                </span>
                <div>
                  <p className="text-xs font-black">نقاط لكل إعلان مكتمل</p>
                  <p className="text-[10px] text-neutral-800">تُضاف لمحفظتك في ثوانٍ</p>
                </div>
              </div>
              <span className="rounded-full bg-black text-[#CCFF00] px-3 py-1 font-mono text-xs font-black">
                بدون رسوم 100%
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      duration: 13,
      title: "القسم الرابع: «سيول» (Sayool Services Catalog)",
      subtitle: "كتالوج الخدمات الرقمية: بوتات متاجر ذكية، سوشيال ميديا، تصميم وبرمجيات",
      badge: "✦ 04 / DIGITAL SERVICES ✦",
      accentColor: "#FACC15",
      secondaryColor: "#0C0D14",
      sectionLink: "/services",
      sectionLinkLabel: "تصفح خدمات سيول",
      voiceText:
        "القسم الرابع هو قسم سيول للخدمات. يضم باقة حصرية من أرقى الخدمات الرقمية مثل بوت استلام طلبات المتاجر الذكي، زيادة آلاف المتابعين الحقيقيين على انستقرام، تصميم الهويات البصرية، وبناء المواقع السحابية المتكاملة.",
      renderVisual: () => (
        <div className="w-full max-w-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="rounded-2xl border-3 border-black bg-[#FACC15] p-4 sm:p-5 text-black shadow-[5px_5px_0px_0px_black]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-black text-white px-3 py-1 text-xs font-mono font-black">
                🛍️ الخدمة المميزة: بوت طلبات المتاجر
              </span>
              <span className="text-xs font-black bg-black/15 px-2 py-0.5 rounded">
                NEW ★
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <img
                src={storeBotImg}
                alt="بوت استلام طلبات المتاجر"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border-2 border-black shadow-[3px_3px_0px_0px_black]"
              />
              <div>
                <h4 className="text-base sm:text-lg font-black leading-snug">
                  بوت ذكي لاستلام طلبات المتاجر
                </h4>
                <p className="text-xs text-neutral-800 line-clamp-2 mt-0.5">
                  أتمتة كاملة للطلبات، إصدار الفواتير الفورية وإرسال إشعارات التوصيل لصاحب المتجر.
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-xs font-black font-mono">
                  <span className="bg-black text-[#FACC15] px-2 py-0.5 rounded">45$ نقداً</span>
                  <span className="text-neutral-900">أو 2,200 نقطة مجانية</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="rounded-xl border-2 border-black bg-[#151722] p-2 text-white shadow-[2px_2px_0px_0px_black]">
              📸 متابعين حقيقيين
            </div>
            <div className="rounded-xl border-2 border-black bg-[#151722] p-2 text-white shadow-[2px_2px_0px_0px_black]">
              🎨 تصميم وهوية
            </div>
            <div className="rounded-xl border-2 border-black bg-[#151722] p-2 text-white shadow-[2px_2px_0px_0px_black]">
              🌐 مواقع وسحابة
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      duration: 16,
      title: "كيف تكسب وتستلم خدمتك مجاناً؟ (دليل 4 خطوات)",
      subtitle: "الشرح العملي المبسط: من الصفر حتى استلام وتنفيذ خدمتك الرقمية بدون دفع أي قرش!",
      badge: "✦ 05 / HOW TO CLAIM FOR FREE ✦",
      accentColor: "#CCFF00",
      secondaryColor: "#0066FF",
      sectionLink: "/services",
      sectionLinkLabel: "اطلب خدمتك الآن",
      voiceText:
        "والآن، إليكم الطريقة العملية لكسب واستلام أي خدمة مجاناً في 4 خطوات بسيطة: أولاً، سجل دخولك بحساب Google؛ ثانياً، ادخل قسم المكافآت وشاهد الإعلانات لتجميع النقاط؛ ثالثاً، توجه لصفحة سيول واختر الخدمة التي تريدها؛ رابعاً، اضغط طلب بالنقاط وأدخل رقمك على واتساب أو تيليجرام لتستلم خدمتك فوراً وبالمجان!",
      renderVisual: () => (
        <div className="w-full max-w-xl p-4 space-y-2.5 animate-in fade-in zoom-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-2xl border-2 border-black bg-[#0C0D14] p-3.5 shadow-[3px_3px_0px_0px_black] flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#CCFF00] text-black font-black text-sm">
                1
              </span>
              <div>
                <h4 className="text-xs font-black text-white">تسجيل الدخول السريع</h4>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  سجل دخولك بنقرة واحدة بحسابك في Google.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-black bg-[#0C0D14] p-3.5 shadow-[3px_3px_0px_0px_black] flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#EC4899] text-black font-black text-sm">
                2
              </span>
              <div>
                <h4 className="text-xs font-black text-white">اجمع النقاط مجاناً</h4>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  شاهد إعلانات قسم المكافآت واكسب 50 نقطة لكل إعلان.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-black bg-[#0C0D14] p-3.5 shadow-[3px_3px_0px_0px_black] flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#FACC15] text-black font-black text-sm">
                3
              </span>
              <div>
                <h4 className="text-xs font-black text-white">اختر خدمتك من «سيول»</h4>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  اختر البوت أو التصميم أو المتابعين واضغط «طلب الخدمة».
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-black bg-[#0C0D14] p-3.5 shadow-[3px_3px_0px_0px_black] flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#0066FF] text-white font-black text-sm">
                4
              </span>
              <div>
                <h4 className="text-xs font-black text-white">اختر الدفع بالنقاط واستلم</h4>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  ضع رقمك واتساب أو تيليجرام واستلم خدمتك بدون دفع فلس!
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-[#CCFF00] bg-black/60 p-2.5 text-center font-mono text-xs text-[#CCFF00] font-black shadow-[2px_2px_0px_0px_white]">
            ✓ متاح أيضاً الشراء المباشر بالدولار عبر Payoneer أو USDT TRC20 عند الرغبة
          </div>
        </div>
      ),
    },
    {
      id: 7,
      duration: 10,
      title: "انضم إلينا الآن وابدأ بجمع نقاطك!",
      subtitle: "المنصة متاحة على مدار 24 ساعة لخدمتك ودعم مشاريعك الرقمية",
      badge: "✦ 06 / CALL TO ACTION ✦",
      accentColor: "#CCFF00",
      secondaryColor: "#7C3AED",
      voiceText:
        "ماذا تنتظر؟ انضم إلينا اليوم، وابدأ بجمع أولى نقاطك المجانية واستبدالها بخدمات رقمية استثنائية! منصة خدمة العملاء وسيول، شريكك الأفضل للنجاح الرقمي.",
      renderVisual: () => (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-5 animate-in fade-in zoom-in duration-500">
          <div className="h-20 w-20 rounded-full bg-[#CCFF00] text-black font-black grid place-items-center text-3xl border-4 border-black shadow-[5px_5px_0px_0px_white] animate-bounce">
            🚀
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              ابدأ الآن مجاناً وبدون أي تعقيد
            </h3>
            <p className="text-xs sm:text-sm font-mono text-neutral-300">
              سجل دخولك الآن عبر Google أو باشر جمع النقاط وتصفح الخدمات الفورية.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onStartGoogleLogin && (
              <button
                onClick={() => {
                  onClose();
                  onStartGoogleLogin();
                }}
                className="rounded-full bg-[#CCFF00] text-black font-black px-6 py-2.5 text-sm shadow-[4px_4px_0px_0px_white] hover:bg-[#b8e600] transition active:translate-y-0.5 flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span>تسجيل الدخول بجوجل</span>
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onNavigateSection?.("/services");
              }}
              className="rounded-full border-2 border-white bg-[#151722] text-white font-black px-6 py-2.5 text-sm hover:border-[#CCFF00] transition flex items-center gap-2"
            >
              <Layers3 size={16} />
              <span>كتالوج سيول</span>
            </button>
          </div>
        </div>
      ),
    },
  ];

  const activeScene = scenes[currentSceneIdx];

  // Speech synthesis logic for Arabic voiceover
  const speakCurrentScene = (scene: Scene) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (isMuted) return;

    try {
      const utterance = new SpeechSynthesisUtterance(scene.voiceText);
      utterance.lang = "ar-SA";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Check for available Arabic voices
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(
        (v) => v.lang.startsWith("ar") || v.lang.includes("Arabic")
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Trigger speech when scene changes or modal opens
  useEffect(() => {
    if (isOpen && isPlaying) {
      speakCurrentScene(activeScene);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [currentSceneIdx, isPlaying, isMuted, isOpen]);

  // Handle timeline progress and auto-advancing
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    setSceneProgress(0);
    const stepIntervalMs = 100;
    const totalSteps = (activeScene.duration * 1000) / stepIntervalMs;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const pct = Math.min(100, (step / totalSteps) * 100);
      setSceneProgress(pct);

      if (step >= totalSteps) {
        clearInterval(timer);
        if (currentSceneIdx < scenes.length - 1) {
          setCurrentSceneIdx((prev) => prev + 1);
        } else {
          // Finished all scenes, stop playing
          setIsPlaying(false);
        }
      }
    }, stepIntervalMs);

    return () => clearInterval(timer);
  }, [currentSceneIdx, isPlaying, isOpen, activeScene.duration]);

  // Cleanup speech on modal close
  useEffect(() => {
    if (!isOpen && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // The complete professional video script for YouTube / TikTok / Reels
  const promoScriptContent = `
🎬 السيناريو الكامل للفيديو الترويجي لمنصة خدمة العملاء وسيول
======================================================
⏱️ المدة الإجمالية المقترحة: 1:30 دقيقة
🎯 المنصات: TikTok, Instagram Reels, YouTube Shorts, Web Player
🎨 النمط البصري: Pop Bento / Neo-Brutalist ألوان نيون وخلفيات داكنة فخمة
🎵 الموسيقى المقترحة: Lo-Fi Cyber Synth أو Upbeat Tech Corporate

------------------------------------------------------
المشهد 1 (0:00 - 0:11) - المقدمة والانطلاقة
------------------------------------------------------
[المشهد البصري]:
شعار المنصة ينبثق مع نجوم لامعة ثلاثية الأبعاد بأسلوب نيو-بروتاليست بلون أخضر ليموني ساطع (#CCFF00) مع شارات "100% موثوق في اليمن والعالم"، ولقطات خاطفة للبطاقات.
[التعليق الصوتي الصوتي - Voiceover]:
"أهلاً بكم في منصة خدمة العملاء وسيول الرقمية! وجهتكم المتكاملة الأولى للحصول على أرقى الخدمات البرمجية والتسويقية، المشاركة في أضخم المسابقات الدورية، وربح نقاط مجانية واستبدالها بخدمات حقيقية بدون أي تكاليف."

------------------------------------------------------
المشهد 2 (0:11 - 0:23) - قسم تيك محلي (نظرة عامة)
------------------------------------------------------
[المشهد البصري]:
لقطة سريعة لواجهة "تيك محلي" الرئيسية مع إبراز رصيد النقاط (1,250 PTS)، تذاكر المسابقات، والنشاطات الحديثة مع زر Google السريع.
[التعليق الصوتي - Voiceover]:
"قسم تيك محلي هو لوحة التحكم المركزية الخاصة بك. من خلال هذا القسم تتابع رصيد نقاطك المحدث لحظة بلحظة، إحصائيات النشاط، وتصل مباشرة لكافة أدوات المنصة بضغطة زر واحدة."

------------------------------------------------------
المشهد 3 (0:23 - 0:35) - قسم المسابقات والجوائز
------------------------------------------------------
[المشهد البصري]:
كأس ذهبي ثلاثي الأبعاد مع عداد تنازلي نشط وبطاقة جائزة 500$ نقداً عبر Payoneer و USDT TRC20 مع بيان شروط السحب المشفر العادل.
[التعليق الصوتي - Voiceover]:
"في قسم المسابقات، نقدم لك فرصة استثنائية للتنافس على جوائز مالية كبرى كجائزة الـ 500 دولار نقداً عبر بايونير أو تيذر USDT! كل تذكرة مشاركة تقربك من الفوز بالسحب المشفر النزيه."

------------------------------------------------------
المشهد 4 (0:35 - 0:48) - قسم المكافآت والإعلانات
------------------------------------------------------
[المشهد البصري]:
محاكاة لمشاهدة إعلان تفاعلي وعداد الثواني، ثم انفجار عملات ذهبية ونقاط (+50 PTS) تضاف مباشرة للمحفظة مع عبارة "مجاناً 100%".
[التعليق الصوتي - Voiceover]:
"قسم المكافآت والإعلانات هو منجم الذهب الخاص بك! لا تحتاج لدفع أي أموال؛ فقط شاهد إعلانات تفاعلية قصيرة وممتعة، واكسب فوراً 50 نقطة لكل إعلان تضاف مباشرة إلى رصيدك مجاناً!"

------------------------------------------------------
المشهد 5 (0:48 - 1:01) - قسم سيول (كتالوج الخدمات الرقمية)
------------------------------------------------------
[المشهد البصري]:
عرض لبطاقات سيول الملونة: بوت استلام طلبات المتاجر الذكي الجديد بصورته الثلاثية الأبعاد، 1000 متابع انستقرام، تصميم الهويات، والمواقع الشخصية.
[التعليق الصوتي - Voiceover]:
"قسم سيول هو سوقك الرقمي الموثوق؛ يضم خدمات احترافية متكاملة كبوتات المتاجر الذكية، زيادة المتابعين، وتصميم الهويات والمواقع الإلكترونية بأعلى معايير الجودة والتسليم الفوري."

------------------------------------------------------
المشهد 6 (1:01 - 1:17) - الدليل العملي: كيف تكسب وتستلم خدمة مجاناً؟
------------------------------------------------------
[المشهد البصري]:
مخطط تفاعلي من 4 خطوات واضحة ومرقمة:
1. تسجيل دخول بجوجل
2. مشاهدة الإعلانات وجمع النقاط
3. اختيار الخدمة من سيول
4. الضغط على "طلب بالنقاط" وإدخال الواتساب/تيليجرام للاستلام الفوري
[التعليق الصوتي - Voiceover]:
"كيف تكسب وتستلم خدمتك مجاناً؟ الأمر بغاية السهولة: أولاً، سجل دخولك بحسابك؛ ثانياً، ادخل قسم المكافآت وشاهد الإعلانات لجمع النقاط؛ ثالثاً، اختر خدمتك المفضلة من سيول؛ رابعاً، اضغط طلب بالنقاط وأدخل رقمك على واتساب أو تيليجرام ليصلك التنفيذ فوراً وبالمجان تماماً!"

------------------------------------------------------
المشهد 7 (1:17 - 1:30) - الخاتمة والدعوة للتجربة (Call To Action)
------------------------------------------------------
[المشهد البصري]:
صاروخ إقلاع وعبارة "انضم إلينا الآن واكسب أولى نقاطك"، مع رابط الموقع ورمز الاستجابة السريعة (QR Code).
[التعليق الصوتي - Voiceover]:
"ماذا تنتظر؟ انضم إلينا اليوم، وابدأ بجمع أولى نقاطك المجانية واستبدالها بخدمات رقمية استثنائية! منصة خدمة العملاء وسيول، شريكك الأفضل للنجاح الرقمي."
`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(promoScriptContent);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-5 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border-4 border-black bg-[#08090E] shadow-[8px_8px_0px_0px_white] overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Bar / Header */}
        <div className="flex items-center justify-between border-b-3 border-black bg-[#0E1017] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#CCFF00] text-black font-black shadow-[2px_2px_0px_0px_white]">
              <Video size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  الفيديو الترويجي ودليل الاستخدام
                </h3>
                <span className="hidden sm:inline-block rounded-full bg-[#CCFF00] text-black px-2 py-0.5 font-mono text-[10px] font-black">
                  PROMO 4K
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400">
                شرح شامل لكافة أقسام الموقع وطريقة كسب واستلام الخدمات مجاناً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScriptTab(!showScriptTab)}
              className={`flex items-center gap-1.5 rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black transition ${
                showScriptTab
                  ? "bg-[#CCFF00] text-black"
                  : "bg-[#1A1D27] text-white hover:bg-neutral-800"
              }`}
              title="عرض سيناريو النص الإعلاني"
            >
              <FileText size={14} />
              <span className="hidden sm:inline">نص الإعلان 📋</span>
            </button>

            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl border-2 border-black bg-neutral-800 text-white hover:bg-red-600 transition"
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Script Viewer Drawer if activated */}
        {showScriptTab ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B0C12] text-neutral-200 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold text-[#CCFF00]">
                  سيناريو الفيديو الإعلاني الترويجي الكامل (Voiceover Script)
                </h4>
                <p className="text-[11px] text-neutral-400">
                  جاهز للنسخ والتسجيل الصوتي والمونتاج في برامج الفيديو (CapCut / Premiere)
                </p>
              </div>
              <button
                onClick={copyScriptToClipboard}
                className="flex items-center gap-1.5 rounded-xl bg-[#CCFF00] text-black font-black px-3.5 py-1.5 text-xs shadow-[2px_2px_0px_0px_white] hover:bg-[#b8e600]"
              >
                {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedScript ? "تم النسخ!" : "نسخ السيناريو"}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed text-neutral-300 font-sans text-xs sm:text-sm bg-black/60 p-4 rounded-2xl border border-white/10">
              {promoScriptContent}
            </pre>
          </div>
        ) : (
          /* The Video Player Canvas */
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#08090E] via-[#0E1019] to-[#08090E] relative min-h-[380px] sm:min-h-[460px]">
            {/* Top Scene Indicator Bar */}
            <div className="p-3 sm:p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: activeScene.accentColor }}
                  className="rounded-full text-black px-3 py-0.5 text-[11px] font-black font-mono shadow-[2px_2px_0px_0px_black]"
                >
                  {activeScene.badge}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  المشهد {currentSceneIdx + 1} من {scenes.length}
                </span>
              </div>

              {activeScene.sectionLink && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateSection?.(activeScene.sectionLink!);
                  }}
                  className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs font-black text-white hover:border-[#CCFF00] transition"
                >
                  <span>{activeScene.sectionLinkLabel}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            {/* Main Visual Scene Area */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
              {activeScene.renderVisual()}
            </div>

            {/* Bottom Subtitle / Voiceover Banner */}
            <div className="px-4 py-3 sm:px-6 bg-black/75 border-t border-white/10 backdrop-blur-md">
              <div className="max-w-3xl mx-auto space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#CCFF00] font-bold flex items-center gap-1">
                    <Volume2 size={13} />
                    <span>التعليق الصوتي الصوتي الترويجي (عربي):</span>
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {Math.round((activeScene.duration * sceneProgress) / 100)}ث / {activeScene.duration}ث
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-sans font-medium text-neutral-200 leading-relaxed line-clamp-2">
                  "{activeScene.voiceText}"
                </p>
              </div>
            </div>

            {/* Linear Timeline Progress for current scene */}
            <div className="h-1.5 w-full bg-white/10">
              <div
                className="h-full transition-all duration-100 ease-linear"
                style={{
                  width: `${sceneProgress}%`,
                  backgroundColor: activeScene.accentColor,
                }}
              />
            </div>
          </div>
        )}

        {/* Video Control Bar */}
        <div className="border-t-3 border-black bg-[#0C0D14] px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-[#CCFF00] text-black font-black shadow-[2px_2px_0px_0px_white] hover:bg-[#b8e600] transition active:scale-95"
              title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
            </button>

            <button
              onClick={() => {
                setCurrentSceneIdx(0);
                setSceneProgress(0);
                setIsPlaying(true);
              }}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-[#171923] text-neutral-300 hover:text-white transition"
              title="إعادة من البداية"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-xs font-mono transition ${
                isMuted
                  ? "bg-red-500/20 text-red-300 border-red-500/40"
                  : "bg-[#171923] text-[#CCFF00]"
              }`}
              title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span className="hidden sm:inline">
                {isMuted ? "الصوت مكتوم" : "تعليق صوتي عربي"}
              </span>
            </button>
          </div>

          {/* Scene Selectors Dots / Badges */}
          <div className="flex items-center gap-1.5">
            {scenes.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSceneIdx(idx);
                  setSceneProgress(0);
                  setIsPlaying(true);
                }}
                className={`h-2.5 rounded-full transition-all duration-200 ${
                  currentSceneIdx === idx
                    ? "w-8 bg-[#CCFF00]"
                    : "w-2.5 bg-white/20 hover:bg-white/50"
                }`}
                title={`المشهد ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          {/* Step Back / Forward */}
          <div className="flex items-center gap-2">
            <button
              disabled={currentSceneIdx === 0}
              onClick={() => {
                setCurrentSceneIdx((prev) => Math.max(0, prev - 1));
                setSceneProgress(0);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-white/15 bg-[#171923] text-xs font-mono text-neutral-300 disabled:opacity-40 hover:text-white"
            >
              <ChevronRight size={15} />
              <span className="hidden sm:inline">السابق</span>
            </button>

            <button
              disabled={currentSceneIdx === scenes.length - 1}
              onClick={() => {
                setCurrentSceneIdx((prev) => Math.min(scenes.length - 1, prev + 1));
                setSceneProgress(0);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#CCFF00] text-black text-xs font-mono font-black disabled:opacity-40 hover:bg-[#b8e600]"
            >
              <span className="hidden sm:inline">التالي</span>
              <ChevronLeft size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

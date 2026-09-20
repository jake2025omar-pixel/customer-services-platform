import { db, storage, auth } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import storeBotImg from "@/assets/store_order_bot.jpg";

export const isGitHubPages =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("github.io") ||
    window.location.pathname.includes("/customer-services-platform") ||
    window.location.port === "" ||
    !window.location.port);

export type Service = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  pointsPrice: number | null;
  usdPrice: string | null;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt?: any;
};

export type Campaign = {
  id: string;
  name: string;
  prize: string;
  startsAt: string | Date;
  endsAt: string | Date;
  eligibility: string;
  officialRules: string;
  winnerSelection: string;
  prizeDelivery: string;
  ticketCost: number;
  participantCount: number;
  userJoined: boolean;
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "tiktok-followers-1k",
    title: "1000 متابع تيك توك حقيقي",
    description: "زيادة 1000 متابع حقيقي متفاعل لحسابك على تيك توك بسرعة تنفيذ فائقة وضمان ثبات المتابعين.",
    imageUrl: "https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?auto=format&fit=crop&w=800&q=80",
    pointsPrice: 125,
    usdPrice: "20",
    category: "سوشيال ميديا",
    stock: 999,
    isActive: true,
  },
  {
    id: "instagram-followers-1k",
    title: "1000 متابع انستقرام حقيقي",
    description: "زيادة 1000 متابع حقيقي متفاعل لحسابك على انستقرام مع ضمان عدم النقص وسرعة تنفيذ فائقة.",
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
    pointsPrice: 125,
    usdPrice: "20",
    category: "سوشيال ميديا",
    stock: 999,
    isActive: true,
  },
  {
    id: "store-order-bot",
    title: "بوت ذكي لاستلام طلبات المتاجر",
    description: "بوت تفاعلي متطور (تيليجرام / واتساب / ويب) لاستلام ومعالجة طلبات المتاجر آلياً، حساب الإجمالي، إصدار الفواتير الفورية وإرسال إشعارات فورية للإدارة.",
    imageUrl: storeBotImg,
    pointsPrice: 500,
    usdPrice: "45",
    category: "متاجر وأتمتة",
    stock: 999,
    isActive: true,
  },
  {
    id: "pro-logo-design",
    title: "تصميم شعار وهوية بصرية احترافية",
    description: "تصميم هوية بصرية وشعار احترافي وفريد يعكس هوية علامتك التجارية مع ملفات مفتوحة المصدر.",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    pointsPrice: 1200,
    usdPrice: "10",
    category: "تصميم",
    stock: 999,
    isActive: true,
  },
  {
    id: "targeted-ads-campaign",
    title: "حملة إعلانية ممولة ومستهدفة",
    description: "إطلاق وإدارة حملة إعلانية مخصصة على منصات التواصل مع استهداف دقيق للجمهور المهتم.",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    pointsPrice: 800,
    usdPrice: "25",
    category: "تسويق",
    stock: 999,
    isActive: true,
  },
  {
    id: "personal-portfolio-site",
    title: "موقع ويب شخصي متكامل ومتجاوب",
    description: "بناء وتصميم موقع ويب شخصي احترافي ومتجاوب مع جميع الشاشات لعرض أعمالك وخبراتك.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    pointsPrice: 2000,
    usdPrice: "50",
    category: "مواقع",
    stock: 999,
    isActive: true,
  },
  {
    id: "telegram-automation-bot",
    title: "بوت تيليجرام تفاعلي وإشعارات فورية",
    description: "برمجة روبوت تيليجرام ذكي للرد الآلي، إدارة القنوات، وتلقي الإشعارات الفورية للأنظمة والمتاجر.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    pointsPrice: 1500,
    usdPrice: "35",
    category: "أتمتة",
    stock: 999,
    isActive: true,
  },
  {
    id: "cloud-solutions-consulting",
    title: "استشارة تقنية وحلول سحابية فورية",
    description: "جلسة استشارية متخصصة لتحسين أداء الأنظمة، حلول الربط البرمجي، والدعم الفني المباشر.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    pointsPrice: 1800,
    usdPrice: "40",
    category: "برمجة",
    stock: 999,
    isActive: true,
  },
];

export const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: "mega-reward-2026",
    name: "مسابقة المكافأة الكبرى - 500$ نقداً عبر Payoneer / USDT",
    prize: "500$ نقداً (Payoneer أو USDT TRC20)",
    startsAt: "2026-09-01T00:00:00.000Z",
    endsAt: "2026-10-31T23:59:59.000Z",
    eligibility: "متاح لجميع المستخدمين المسجلين في المنصة في اليمن وجميع دول العالم.",
    officialRules: "يتم احتساب تذكرة مشاركة مقابل كل 50 تذكرة/نقطة يتم استبدالها. السحب عشوائي ومشفر.",
    winnerSelection: "سحب آلي عشوائي شفاف وموثق مباشرة على الموقع وقناة التليجرام.",
    prizeDelivery: "تحويل مباشر إلى حساب Payoneer أو محفظة OKX USDT TRC20 الخاصة بالفائز.",
    ticketCost: 50,
    participantCount: 42,
    userJoined: false,
  },
  {
    id: "pro-laptop-raffle",
    name: "سحب حاسوب عمل محمول للمطورين وصناع المحتوى",
    prize: "حاسوب محمول عالي الأداء أو قيمته كاش 800$",
    startsAt: "2026-09-10T00:00:00.000Z",
    endsAt: "2026-11-15T23:59:59.000Z",
    eligibility: "الاشتراك مفتوح لكافة الأعضاء الذين أكملوا مشاهدة 5 إعلانات على الأقل.",
    officialRules: "تذكرة واحدة لكل مشارك. يُعلن عن الفائز بالبث المباشر الموثق.",
    winnerSelection: "سحب خوارزمي غير قابل للتلاعب.",
    prizeDelivery: "شحن مجاني للمقر أو تسليم القيمة نقداً بالدولار.",
    ticketCost: 30,
    participantCount: 78,
    userJoined: false,
  },
];

/**
 * Fetch services from Firestore.
 * If Firestore has no documents, seeds the initial defaults and returns them.
 */
export async function getFirestoreServices(onlyActive = true): Promise<Service[]> {
  try {
    const servicesRef = collection(db, "services");
    const q = onlyActive
      ? query(servicesRef, where("isActive", "==", true))
      : query(servicesRef);

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const items: Service[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          title: data.title || "",
          description: data.description || "",
          imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80",
          pointsPrice: data.pointsPrice ?? (data.points_price ? Number(data.points_price) : null),
          usdPrice: data.usdPrice ?? (data.usd_price ? String(data.usd_price) : null),
          category: data.category || "عام",
          stock: data.stock !== undefined ? Number(data.stock) : 10,
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
          createdAt: data.createdAt,
        });
      });
      return items;
    }

    // Seed default services into Firestore if empty
    try {
      for (const item of DEFAULT_SERVICES) {
        await setDoc(doc(db, "services", item.id), {
          ...item,
          createdAt: serverTimestamp(),
        });
      }
    } catch (seedErr) {
      console.warn("[Firestore] Auto-seed warning:", seedErr);
    }

    return onlyActive ? DEFAULT_SERVICES.filter((s) => s.isActive) : DEFAULT_SERVICES;
  } catch (err) {
    console.warn("[Firestore] Unable to load services from Firestore, using defaults:", err);
    return onlyActive ? DEFAULT_SERVICES.filter((s) => s.isActive) : DEFAULT_SERVICES;
  }
}

/**
 * Create or update a service in Firestore.
 */
export async function saveFirestoreService(
  service: Partial<Service> & {
    id?: string;
    points_price?: string;
    usd_price?: string;
    image_base64?: string;
    image_file?: File;
  }
): Promise<string> {
  let finalImageUrl = service.imageUrl || service.image_base64 || "";

  // Upload image to Firebase Storage if a File was provided
  if (service.image_file) {
    try {
      const storageRef = ref(storage, `services/${Date.now()}_${service.image_file.name}`);
      const uploaded = await uploadBytes(storageRef, service.image_file);
      finalImageUrl = await getDownloadURL(uploaded.ref);
    } catch (uploadErr) {
      console.warn("[Firebase Storage] Upload failed, falling back to base64/placeholder:", uploadErr);
    }
  }

  const payload: any = {
    title: service.title || "",
    description: service.description || "",
    category: service.category || "عام",
    pointsPrice: service.points_price ? Number(service.points_price) : service.pointsPrice ?? null,
    usdPrice: service.usd_price !== undefined ? String(service.usd_price) : service.usdPrice ?? null,
    stock: service.stock !== undefined ? Number(service.stock) : 0,
    isActive: service.isActive !== undefined ? Boolean(service.isActive) : true,
    updatedAt: serverTimestamp(),
  };

  if (finalImageUrl) {
    payload.imageUrl = finalImageUrl;
  }

  if (service.id) {
    const docRef = doc(db, "services", service.id);
    await updateDoc(docRef, payload);
    return service.id;
  } else {
    payload.createdAt = serverTimestamp();
    const docRef = await addDoc(collection(db, "services"), payload);
    return docRef.id;
  }
}

/**
 * Delete a service from Firestore.
 */
export async function deleteFirestoreService(id: string): Promise<void> {
  const docRef = doc(db, "services", id);
  await deleteDoc(docRef);
}

/**
 * Fetch campaigns from Firestore or defaults.
 */
export async function getFirestoreCampaigns(): Promise<Campaign[]> {
  try {
    const campaignsRef = collection(db, "campaigns");
    const snapshot = await getDocs(campaignsRef);

    if (!snapshot.empty) {
      const items: Campaign[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name || "",
          prize: data.prize || "",
          startsAt: data.startsAt || new Date().toISOString(),
          endsAt: data.endsAt || new Date().toISOString(),
          eligibility: data.eligibility || "",
          officialRules: data.officialRules || "",
          winnerSelection: data.winnerSelection || "",
          prizeDelivery: data.prizeDelivery || "",
          ticketCost: Number(data.ticketCost || 50),
          participantCount: Number(data.participantCount || 0),
          userJoined: Boolean(data.userJoined),
        });
      });
      return items;
    }

    // Seed defaults if empty
    try {
      for (const item of DEFAULT_CAMPAIGNS) {
        await setDoc(doc(db, "campaigns", item.id), {
          ...item,
          createdAt: serverTimestamp(),
        });
      }
    } catch {}

    return DEFAULT_CAMPAIGNS;
  } catch (err) {
    console.warn("[Firestore] Unable to load campaigns, using defaults:", err);
    return DEFAULT_CAMPAIGNS;
  }
}

/**
 * Add points using Firestore transaction on users/{docId}.points
 */
export async function addRewardPointsWithTransaction(
  userEmail: string,
  points = 5
): Promise<{ success: boolean; newPoints: number }> {
  const safeEmail = (userEmail || "anonymous@member.com").toLowerCase();
  const docId = safeEmail.replace(/[^a-z0-9_.-]/g, "_");
  const userRef = doc(db, "users", docId);

  let updatedBalance = 100;

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const existingData = userDoc.exists() ? userDoc.data() : null;
      const current = existingData ? (existingData.pointsBalance ?? existingData.points ?? 0) : 100;
      updatedBalance = current + points;

      transaction.set(
        userRef,
        {
          email: safeEmail,
          points: updatedBalance,
          pointsBalance: updatedBalance,
          lastRewardedAdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    });

    // Also record session log in ad_sessions
    try {
      const sessionRef = doc(db, "ad_sessions", `${docId}_${Date.now()}`);
      await setDoc(sessionRef, {
        userEmail: safeEmail,
        points: points,
        provider: "hilltopads",
        url: "https://elementarywhole.com/cP7F6y",
        status: "verified",
        createdAt: serverTimestamp(),
      });
    } catch {}

    // Update local storage
    try {
      const raw = localStorage.getItem("gh_pages_user");
      const u = raw ? JSON.parse(raw) : { email: safeEmail, name: "Member" };
      u.pointsBalance = updatedBalance;
      u.points = updatedBalance;
      localStorage.setItem("gh_pages_user", JSON.stringify(u));
      localStorage.setItem("manus-runtime-user-info", JSON.stringify(u));
    } catch {}

    return { success: true, newPoints: updatedBalance };
  } catch (err) {
    console.warn("[Firestore] Transaction error, applying fallback local update:", err);

    // Fallback local update
    try {
      const raw = localStorage.getItem("gh_pages_user");
      const u = raw ? JSON.parse(raw) : { email: safeEmail, name: "Member" };
      updatedBalance = (u.pointsBalance ?? 100) + points;
      u.pointsBalance = updatedBalance;
      u.points = updatedBalance;
      localStorage.setItem("gh_pages_user", JSON.stringify(u));
      localStorage.setItem("manus-runtime-user-info", JSON.stringify(u));
    } catch {}

    return { success: true, newPoints: updatedBalance };
  }
}

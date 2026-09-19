import crypto from "node:crypto";
import { and, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditLogs,
  campaignEntries,
  campaignTicketLedger,
  campaigns,
  InsertUser,
  User,
  Service,
  Campaign,
  Order,
  RewardSession,
  RewardTransaction,
  PointsLedgerEntry,
  CampaignTicketLedgerEntry,
  orders,
  pointsLedger,
  rewardSessions,
  rewardTransactions,
  services,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { hashToken } from "./rewards";
import { sendOrderToTelegram } from "../services/telegram_service.js";

let _db: ReturnType<typeof drizzle> | null = null;
let _dbInitAttempted = false;

function isValidMySQLUrl(urlString?: string): boolean {
  if (!urlString) return false;
  // Ignore local file paths or SQLite database paths often pre-configured in container environments
  if (
    urlString.startsWith("./") ||
    urlString.startsWith("../") ||
    urlString.startsWith("/") ||
    urlString.endsWith(".db") ||
    urlString.endsWith(".sqlite")
  ) {
    return false;
  }
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === "mysql:" || parsed.protocol === "mysqls:";
  } catch {
    return false;
  }
}

export async function getDb() {
  if (!_dbInitAttempted) {
    _dbInitAttempted = true;
    const dbUrl = process.env.DATABASE_URL?.trim();
    if (dbUrl && isValidMySQLUrl(dbUrl)) {
      try {
        _db = drizzle(dbUrl);
      } catch (error) {
        console.warn("[Database] Failed to connect to MySQL, using in-memory store:", error);
        _db = null;
      }
    } else {
      _db = null;
    }
  }
  return _db;
}

// ==========================================
// In-Memory Database Fallback Store
// ==========================================
const now = new Date();

const memoryUsers = new Map<string, User>([
  [
    "demo_google_user_001",
    {
      id: 1,
      openId: "demo_google_user_001",
      name: "Google Member",
      email: "member@example.com",
      loginMethod: "google",
      role: "admin",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
  ],
]);

const memoryServices = new Map<string, Service>([
  [
    "srv-001",
    {
      id: "srv-001",
      title: "Premium Cloud Support Tier",
      description: "Priority 24/7 incident response, dedicated cloud infrastructure review, and guaranteed 15-minute response time.",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
      imageKey: null,
      pointsPrice: 150,
      usdPrice: "49.00",
      category: "Support & Maintenance",
      stock: 25,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ],
  [
    "srv-002",
    {
      id: "srv-002",
      title: "Digital Workflow Automation",
      description: "End-to-end integration and custom bot configuration to streamline repetitive business operations and customer intake.",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
      imageKey: null,
      pointsPrice: 220,
      usdPrice: "79.00",
      category: "Optimization",
      stock: 18,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ],
  [
    "srv-003",
    {
      id: "srv-003",
      title: "API Performance & Security Audit",
      description: "In-depth penetration test, rate-limiting verification, HMAC signature validation, and payload integrity assessment.",
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
      imageKey: null,
      pointsPrice: 300,
      usdPrice: "99.00",
      category: "Security",
      stock: 12,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ],
  [
    "srv-004",
    {
      id: "srv-004",
      title: "Dedicated Telegram Integration Hub",
      description: "Custom Telegram bot webhooks, automated order broadcast routing, and team alerts dispatching.",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      imageKey: null,
      pointsPrice: 120,
      usdPrice: "39.00",
      category: "Messaging",
      stock: 30,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ],
]);

const memoryCampaigns = new Map<string, Campaign>([
  [
    "camp-001",
    {
      id: "camp-001",
      name: "Summer Tech Grand Prize",
      prize: "Latest Flagship Tablet + 1 Year Cloud Services Pass",
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      eligibility: "Open to all verified members in good standing. Minimum account age: 24 hours.",
      officialRules: "Standard platform rules apply. Entries are confirmed server-side. Duplicate entries will not charge additional tickets.",
      winnerSelection: "Random automated verifiable draw conducted at campaign end time.",
      prizeDelivery: "Electronic voucher code dispatched via verified Google email within 48 hours.",
      ticketCost: 50,
      isActive: true,
      createdBy: 1,
      createdAt: now,
      updatedAt: now,
    },
  ],
  [
    "camp-002",
    {
      id: "camp-002",
      name: "Developer Toolkit Bundle",
      prize: "$250 Digital Gift Card + Verified Platform Credits",
      startsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      eligibility: "Open to all active workspace participants.",
      officialRules: "Fair play rules enforced. One entry per member.",
      winnerSelection: "Transparent server-side selection.",
      prizeDelivery: "Direct delivery to member registered email.",
      ticketCost: 50,
      isActive: true,
      createdBy: 1,
      createdAt: now,
      updatedAt: now,
    },
  ],
]);

type MemoryCampaignEntry = {
  id: string;
  campaignId: string;
  userId: number;
  ticketsSpent: number;
  idempotencyKey: string;
  createdAt: Date;
};

const memoryCampaignEntries: MemoryCampaignEntry[] = [];
const memoryOrders: Order[] = [];
const memoryRewardSessions: RewardSession[] = [];
const memoryRewardTransactions: RewardTransaction[] = [];
const memoryPointsLedger: PointsLedgerEntry[] = [
  {
    id: "init-pts-1",
    userId: 1,
    type: "REWARD",
    amount: 50,
    referenceId: "welcome-bonus",
    description: "Welcome Member Bonus",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "init-pts-2",
    userId: 1,
    type: "REWARD",
    amount: 75,
    referenceId: "onboarding-activity",
    description: "Verified account setup credit",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];
const memoryTicketLedger: CampaignTicketLedgerEntry[] = [
  {
    id: "init-tkt-1",
    userId: 1,
    campaignId: null,
    amount: 100,
    referenceId: "initial-allocation",
    description: "Initial platform campaign ticket grant",
    createdAt: now,
  },
];

let nextUserId = 2;

// ==========================================
// User Operations
// ==========================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    const existing = memoryUsers.get(user.openId);
    const updatedRole = user.role !== undefined ? user.role : (user.openId === ENV.ownerOpenId ? "admin" : (existing?.role ?? "user"));
    const updated: User = {
      id: existing?.id ?? nextUserId++,
      openId: user.openId,
      name: user.name ?? existing?.name ?? null,
      email: user.email ?? existing?.email ?? null,
      loginMethod: user.loginMethod ?? existing?.loginMethod ?? null,
      role: updatedRole,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
      lastSignedIn: user.lastSignedIn ?? new Date(),
    };
    memoryUsers.set(user.openId, updated);
    return;
  }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    let user = memoryUsers.get(openId);
    if (!user && (openId.startsWith("demo_") || openId === "demo_google_user_001")) {
      user = {
        id: 1,
        openId,
        name: "Google Member",
        email: "member@example.com",
        loginMethod: "google",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };
      memoryUsers.set(openId, user);
    }
    return user;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

async function sumLedger(db: Awaited<ReturnType<typeof getDb>>, table: typeof pointsLedger | typeof campaignTicketLedger, userId: number) {
  if (!db) return 0;
  const [result] = await db.select({ total: sum(table.amount) }).from(table).where(eq(table.userId, userId));
  return Number(result?.total ?? 0);
}

// ==========================================
// Dashboard
// ==========================================
export async function getDashboardData(userId: number) {
  const db = await getDb();
  if (!db) {
    const points = memoryPointsLedger.filter(p => p.userId === userId).reduce((acc, curr) => acc + curr.amount, 0);
    const tickets = memoryTicketLedger.filter(t => t.userId === userId).reduce((acc, curr) => acc + curr.amount, 0);
    const verifiedRewards = memoryRewardTransactions.filter(r => r.userId === userId && r.status === "VERIFIED").length;
    const userOrders = memoryOrders.filter(o => o.userId === userId).length;
    const userSessions = memoryRewardSessions.filter(s => s.userId === userId).length;
    const activeServices = Array.from(memoryServices.values()).filter(s => s.isActive).length;
    const nowTime = Date.now();
    const activeCampaigns = Array.from(memoryCampaigns.values()).filter(
      c => c.isActive && c.startsAt.getTime() <= nowTime && c.endsAt.getTime() >= nowTime
    ).length;
    const recentActivity = memoryPointsLedger
      .filter(p => p.userId === userId)
      .slice(-5)
      .reverse()
      .map(item => ({
        id: item.id,
        type: item.type,
        amount: item.amount,
        description: item.description,
        createdAt: item.createdAt,
      }));

    return {
      points,
      tickets,
      rewards: verifiedRewards,
      orders: userOrders,
      accountStatus: "Active",
      recentActivity,
      sessions: userSessions,
      serviceCount: activeServices,
      activeCampaignCount: activeCampaigns,
    };
  }
  const [rewards] = await db.select({ total: sql<number>`count(*)` }).from(rewardTransactions).where(and(eq(rewardTransactions.userId, userId), eq(rewardTransactions.status, "VERIFIED")));
  const [ordersCount] = await db.select({ total: sql<number>`count(*)` }).from(orders).where(eq(orders.userId, userId));
  const [sessions] = await db.select({ total: sql<number>`count(*)` }).from(rewardSessions).where(eq(rewardSessions.userId, userId));
  const [serviceCount] = await db.select({ total: sql<number>`count(*)` }).from(services).where(eq(services.isActive, true));
  const [activeCampaignCount] = await db.select({ total: sql<number>`count(*)` }).from(campaigns).where(and(eq(campaigns.isActive, true), lte(campaigns.startsAt, new Date()), gte(campaigns.endsAt, new Date())));
  const activity = await db.select().from(pointsLedger).where(eq(pointsLedger.userId, userId)).orderBy(desc(pointsLedger.createdAt)).limit(5);
  return {
    points: await sumLedger(db, pointsLedger, userId),
    tickets: await sumLedger(db, campaignTicketLedger, userId),
    rewards: Number(rewards?.total ?? 0),
    orders: Number(ordersCount?.total ?? 0),
    accountStatus: "Active",
    recentActivity: activity.map(item => ({ id: item.id, type: item.type, amount: item.amount, description: item.description, createdAt: item.createdAt })),
    sessions: Number(sessions?.total ?? 0),
    serviceCount: Number(serviceCount?.total ?? 0),
    activeCampaignCount: Number(activeCampaignCount?.total ?? 0),
  };
}

// ==========================================
// Services CRUD
// ==========================================
export async function listServices(options: { includeInactive?: boolean } = {}) {
  const db = await getDb();
  if (!db) {
    const list = Array.from(memoryServices.values());
    const filtered = options.includeInactive ? list : list.filter(s => s.isActive);
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return options.includeInactive ? db.select().from(services).orderBy(desc(services.createdAt)) : db.select().from(services).where(eq(services.isActive, true)).orderBy(desc(services.createdAt));
}

export async function getServiceById(id: string) {
  const db = await getDb();
  if (!db) {
    return memoryServices.get(id);
  }
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result[0];
}

export async function createService(input: { title: string; description: string; imageUrl: string; imageKey?: string | null; pointsPrice?: number | null; usdPrice?: string | null; category: string; stock: number; isActive: boolean }) {
  const db = await getDb();
  const id = crypto.randomUUID();
  if (!db) {
    const newService: Service = {
      id,
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      imageKey: input.imageKey ?? null,
      pointsPrice: input.pointsPrice ?? null,
      usdPrice: input.usdPrice ?? null,
      category: input.category,
      stock: input.stock,
      isActive: input.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryServices.set(id, newService);
    return newService;
  }
  await db.insert(services).values({ id, title: input.title, description: input.description, imageUrl: input.imageUrl, imageKey: input.imageKey ?? null, pointsPrice: input.pointsPrice ?? null, usdPrice: input.usdPrice ?? null, category: input.category, stock: input.stock, isActive: input.isActive });
  return getServiceById(id);
}

export async function updateService(id: string, input: Partial<{ title: string; description: string; imageUrl: string; imageKey: string | null; pointsPrice: number | null; usdPrice: string | null; category: string; stock: number; isActive: boolean }>) {
  const db = await getDb();
  if (!db) {
    const existing = memoryServices.get(id);
    if (!existing) return undefined;
    const updated: Service = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };
    memoryServices.set(id, updated);
    return updated;
  }
  await db.update(services).set(input).where(eq(services.id, id));
  return getServiceById(id);
}

export async function deleteService(id: string) {
  const db = await getDb();
  if (!db) {
    const existingOrder = memoryOrders.find(o => o.serviceId === id);
    if (existingOrder) throw new Error("Service has existing orders; deactivate it instead of deleting it");
    memoryServices.delete(id);
    return;
  }
  const [existingOrder] = await db.select({ id: orders.id }).from(orders).where(eq(orders.serviceId, id)).limit(1);
  if (existingOrder) throw new Error("Service has existing orders; deactivate it instead of deleting it");
  await db.delete(services).where(eq(services.id, id));
}

// ==========================================
// Campaigns / Contests
// ==========================================
export async function listCampaigns(userId: number) {
  const db = await getDb();
  if (!db) {
    const nowTime = Date.now();
    const rows = Array.from(memoryCampaigns.values()).filter(
      c => c.isActive && c.startsAt.getTime() <= nowTime && c.endsAt.getTime() >= nowTime
    ).sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime());

    return rows.map(campaign => {
      const count = memoryCampaignEntries.filter(e => e.campaignId === campaign.id).length;
      const userJoined = memoryCampaignEntries.some(e => e.campaignId === campaign.id && e.userId === userId);
      return { ...campaign, participantCount: count, userJoined };
    });
  }
  const nowCurrent = new Date();
  const rows = await db.select().from(campaigns).where(and(eq(campaigns.isActive, true), lte(campaigns.startsAt, nowCurrent), gte(campaigns.endsAt, nowCurrent))).orderBy(campaigns.endsAt);
  return Promise.all(rows.map(async campaign => {
    const [count] = await db.select({ total: sql<number>`count(*)` }).from(campaignEntries).where(eq(campaignEntries.campaignId, campaign.id));
    const [joined] = await db.select({ id: campaignEntries.id }).from(campaignEntries).where(and(eq(campaignEntries.campaignId, campaign.id), eq(campaignEntries.userId, userId))).limit(1);
    return { ...campaign, participantCount: Number(count?.total ?? 0), userJoined: Boolean(joined) };
  }));
}

export async function joinCampaign(input: { campaignId: string; userId: number; idempotencyKey: string }) {
  const db = await getDb();
  if (!db) {
    const previous = memoryCampaignEntries.find(e => e.idempotencyKey === input.idempotencyKey);
    if (previous) return { status: "idempotent_replay", entry: previous };

    const campaign = memoryCampaigns.get(input.campaignId);
    if (!campaign || !campaign.isActive || campaign.startsAt.getTime() > Date.now() || campaign.endsAt.getTime() < Date.now()) {
      throw new Error("Campaign is not available");
    }

    const alreadyJoined = memoryCampaignEntries.find(e => e.campaignId === input.campaignId && e.userId === input.userId);
    if (alreadyJoined) return { status: "already_joined", entry: alreadyJoined };

    const availableTickets = memoryTicketLedger.filter(t => t.userId === input.userId).reduce((acc, curr) => acc + curr.amount, 0);
    if (availableTickets < campaign.ticketCost) {
      throw new Error(`You need ${campaign.ticketCost} tickets to join this campaign`);
    }

    const entryId = crypto.randomUUID();
    const entry: MemoryCampaignEntry = {
      id: entryId,
      campaignId: input.campaignId,
      userId: input.userId,
      ticketsSpent: campaign.ticketCost,
      idempotencyKey: input.idempotencyKey,
      createdAt: new Date(),
    };
    memoryCampaignEntries.push(entry);

    memoryTicketLedger.push({
      id: crypto.randomUUID(),
      userId: input.userId,
      campaignId: input.campaignId,
      amount: -campaign.ticketCost,
      referenceId: input.idempotencyKey,
      description: `Joined campaign: ${campaign.name}`,
      createdAt: new Date(),
    });

    return { status: "joined", entry: { id: entryId, campaignId: campaign.id, ticketsSpent: campaign.ticketCost } };
  }
  const previous = await db.select().from(campaignEntries).where(eq(campaignEntries.idempotencyKey, input.idempotencyKey)).limit(1);
  if (previous[0]) return { status: "idempotent_replay", entry: previous[0] };
  const result = await db.transaction(async tx => {
    const [campaign] = await tx.select().from(campaigns).where(eq(campaigns.id, input.campaignId)).limit(1);
    if (!campaign || !campaign.isActive || campaign.startsAt.getTime() > Date.now() || campaign.endsAt.getTime() < Date.now()) throw new Error("Campaign is not available");
    const [alreadyJoined] = await tx.select().from(campaignEntries).where(and(eq(campaignEntries.campaignId, input.campaignId), eq(campaignEntries.userId, input.userId))).limit(1);
    if (alreadyJoined) return { status: "already_joined", entry: alreadyJoined };
    const [ticketBalance] = await tx.select({ total: sum(campaignTicketLedger.amount) }).from(campaignTicketLedger).where(eq(campaignTicketLedger.userId, input.userId));
    const availableTickets = Number(ticketBalance?.total ?? 0);
    if (availableTickets < campaign.ticketCost) throw new Error(`You need ${campaign.ticketCost} tickets to join this campaign`);
    const entryId = crypto.randomUUID();
    await tx.insert(campaignEntries).values({ id: entryId, campaignId: input.campaignId, userId: input.userId, ticketsSpent: campaign.ticketCost, idempotencyKey: input.idempotencyKey });
    await tx.insert(campaignTicketLedger).values({ id: crypto.randomUUID(), userId: input.userId, campaignId: input.campaignId, amount: -campaign.ticketCost, referenceId: input.idempotencyKey, description: `Joined campaign: ${campaign.name}` });
    await tx.insert(auditLogs).values({ id: crypto.randomUUID(), userId: input.userId, action: "CAMPAIGN_JOINED", referenceId: entryId, metadata: JSON.stringify({ campaignId: campaign.id, ticketsSpent: campaign.ticketCost, idempotencyKey: input.idempotencyKey }) });
    return { status: "joined", entry: { id: entryId, campaignId: campaign.id, ticketsSpent: campaign.ticketCost } };
  });
  return result;
}

// ==========================================
// Orders & Payments
// ==========================================
export async function createOrderFromVerifiedPayment(input: { userId: number; serviceId: string; paymentProvider: string; paymentReference: string }) {
  const db = await getDb();
  if (!db) {
    const previous = memoryOrders.find(o => o.paymentProvider === input.paymentProvider && o.paymentReference === input.paymentReference);
    if (previous) return previous;

    const service = memoryServices.get(input.serviceId);
    if (!service || !service.isActive || service.stock <= 0) throw new Error("Service is unavailable");

    const user = Array.from(memoryUsers.values()).find(u => u.id === input.userId);
    if (!user?.email) throw new Error("Verified Google email is required for an order");

    const orderId = crypto.randomUUID();
    const newOrder: Order = {
      id: orderId,
      userId: input.userId,
      serviceId: service.id,
      serviceTitle: service.title,
      googleEmail: user.email,
      pointsPrice: service.pointsPrice,
      usdPrice: service.usdPrice,
      paymentProvider: input.paymentProvider,
      paymentReference: input.paymentReference,
      status: "PAID",
      createdAt: new Date(),
      telegramSentAt: null,
    };
    service.stock = Math.max(0, service.stock - 1);
    memoryOrders.push(newOrder);

    try {
      await sendOrderToTelegram(newOrder);
      newOrder.status = "TELEGRAM_SENT";
      newOrder.telegramSentAt = new Date();
    } catch (error) {
      console.error("[Telegram] Order notification failed", error);
      newOrder.status = "TELEGRAM_FAILED";
    }
    return newOrder;
  }
  const [previous] = await db.select().from(orders).where(and(eq(orders.paymentProvider, input.paymentProvider), eq(orders.paymentReference, input.paymentReference))).limit(1);
  if (previous) return previous;
  const service = await getServiceById(input.serviceId);
  if (!service || !service.isActive || service.stock <= 0) throw new Error("Service is unavailable");
  const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
  if (!user?.email) throw new Error("Verified Google email is required for an order");
  const id = crypto.randomUUID();
  await db.insert(orders).values({ id, userId: input.userId, serviceId: service.id, serviceTitle: service.title, googleEmail: user.email, pointsPrice: service.pointsPrice, usdPrice: service.usdPrice, paymentProvider: input.paymentProvider, paymentReference: input.paymentReference, status: "PAID" });
  await db.update(services).set({ stock: sql`${services.stock} - 1` }).where(eq(services.id, service.id));
  const [created] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  try {
    await sendOrderToTelegram(created);
    await db.update(orders).set({ status: "TELEGRAM_SENT", telegramSentAt: new Date() }).where(eq(orders.id, id));
  } catch (error) {
    console.error("[Telegram] Order notification failed", error);
    await db.update(orders).set({ status: "TELEGRAM_FAILED" }).where(eq(orders.id, id));
  }
  return db.select().from(orders).where(eq(orders.id, id)).limit(1).then(rows => rows[0]);
}

// ==========================================
// Rewards & Sessions
// ==========================================
export async function createRewardSessionRecord(input: { id?: string; userId: number; provider: string; adPlacement: string; sessionTokenHash: string; expiresAt: Date }) {
  const db = await getDb();
  const id = input.id ?? crypto.randomUUID();
  if (!db) {
    const session: RewardSession = {
      id,
      userId: input.userId,
      provider: input.provider,
      adPlacement: input.adPlacement,
      sessionTokenHash: input.sessionTokenHash,
      status: "CREATED",
      createdAt: new Date(),
      expiresAt: input.expiresAt,
      completedAt: null,
      rewardTransactionId: null,
    };
    memoryRewardSessions.push(session);
    return { id };
  }
  await db.insert(rewardSessions).values({ id, userId: input.userId, provider: input.provider, adPlacement: input.adPlacement, sessionTokenHash: input.sessionTokenHash, expiresAt: input.expiresAt, status: "CREATED" });
  await db.insert(auditLogs).values({ id: crypto.randomUUID(), userId: input.userId, action: "REWARD_SESSION_CREATED", referenceId: id });
  return { id };
}

export async function getRewardSessionById(id: string): Promise<RewardSession | undefined> {
  const db = await getDb();
  if (!db) {
    return memoryRewardSessions.find(s => s.id === id);
  }
  return db.select().from(rewardSessions).where(eq(rewardSessions.id, id)).limit(1).then(rows => rows[0]);
}

export async function countUserRewardsSince(userId: number, since: Date) {
  const db = await getDb();
  if (!db) {
    return memoryRewardTransactions.filter(r => r.userId === userId && r.status === "VERIFIED" && r.createdAt >= since).length;
  }
  const [result] = await db.select({ total: sql<number>`count(*)` }).from(rewardTransactions).where(and(eq(rewardTransactions.userId, userId), eq(rewardTransactions.status, "VERIFIED"), gte(rewardTransactions.createdAt, since)));
  return Number(result?.total ?? 0);
}

export type RewardWebhookResult = { rewarded: boolean; duplicate: boolean; reason?: string };

export async function processVerifiedReward(input: { sessionId: string; provider: string; providerTransactionId: string; rewardAmount: number; userId?: number }): Promise<RewardWebhookResult> {
  const db = await getDb();
  if (input.rewardAmount !== 5) return { rewarded: false, duplicate: false, reason: "invalid_reward_amount" };

  if (!db) {
    const existing = memoryRewardTransactions.find(r => r.provider === input.provider && r.providerTransactionId === input.providerTransactionId);
    if (existing) return { rewarded: false, duplicate: true };

    const session = memoryRewardSessions.find(s => s.id === input.sessionId);
    if (!session) return { rewarded: false, duplicate: false, reason: "session_not_found" };
    if (session.expiresAt.getTime() < Date.now()) {
      session.status = "EXPIRED";
      return { rewarded: false, duplicate: false, reason: "session_expired" };
    }
    if (input.userId !== undefined && input.userId !== session.userId) return { rewarded: false, duplicate: false, reason: "user_mismatch" };
    if (session.status === "REWARDED" || session.rewardTransactionId) return { rewarded: false, duplicate: true };

    const transactionId = crypto.randomUUID();
    const nowTime = new Date();
    const transaction: RewardTransaction = {
      id: transactionId,
      userId: session.userId,
      rewardSessionId: session.id,
      provider: input.provider,
      providerTransactionId: input.providerTransactionId,
      rewardAmount: 5,
      status: "VERIFIED",
      createdAt: nowTime,
      verifiedAt: nowTime,
    };
    memoryRewardTransactions.push(transaction);

    memoryPointsLedger.push({
      id: crypto.randomUUID(),
      userId: session.userId,
      type: "REWARD",
      amount: 5,
      referenceId: transactionId,
      description: "Verified rewarded ad completion",
      createdAt: nowTime,
    });

    session.status = "REWARDED";
    session.completedAt = nowTime;
    session.rewardTransactionId = transactionId;

    return { rewarded: true, duplicate: false };
  }

  try {
    return await db.transaction(async tx => {
      const existing = await tx.select().from(rewardTransactions).where(and(eq(rewardTransactions.provider, input.provider), eq(rewardTransactions.providerTransactionId, input.providerTransactionId))).limit(1);
      if (existing.length > 0) return { rewarded: false, duplicate: true };
      const sessions = await tx.select().from(rewardSessions).where(eq(rewardSessions.id, input.sessionId)).limit(1);
      const session = sessions[0];
      if (!session) return { rewarded: false, duplicate: false, reason: "session_not_found" };
      if (session.expiresAt.getTime() < Date.now()) {
        await tx.update(rewardSessions).set({ status: "EXPIRED" }).where(eq(rewardSessions.id, input.sessionId));
        return { rewarded: false, duplicate: false, reason: "session_expired" };
      }
      if (input.userId !== undefined && input.userId !== session.userId) return { rewarded: false, duplicate: false, reason: "user_mismatch" };
      if (session.status === "REWARDED" || session.rewardTransactionId) return { rewarded: false, duplicate: true };
      const transactionId = crypto.randomUUID();
      const nowTime = new Date();
      await tx.insert(rewardTransactions).values({ id: transactionId, userId: session.userId, rewardSessionId: session.id, provider: input.provider, providerTransactionId: input.providerTransactionId, rewardAmount: 5, status: "VERIFIED", createdAt: nowTime, verifiedAt: nowTime });
      await tx.insert(pointsLedger).values({ id: crypto.randomUUID(), userId: session.userId, type: "REWARD", amount: 5, referenceId: transactionId, description: "Verified rewarded ad completion" });
      await tx.update(rewardSessions).set({ status: "REWARDED", completedAt: nowTime, rewardTransactionId: transactionId }).where(eq(rewardSessions.id, session.id));
      await tx.insert(auditLogs).values({ id: crypto.randomUUID(), userId: session.userId, action: "REWARD_GRANTED", referenceId: transactionId, metadata: JSON.stringify({ provider: input.provider, providerTransactionId: input.providerTransactionId }) });
      return { rewarded: true, duplicate: false };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "reward_processing_failed";
    if (message.toLowerCase().includes("duplicate") || message.toLowerCase().includes("unique")) return { rewarded: false, duplicate: true };
    throw error;
  }
}

export function tokenMatches(rawToken: string, storedHash: string) {
  return hashToken(rawToken) === storedHash;
}

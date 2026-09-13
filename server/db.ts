import crypto from "node:crypto";
import { and, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditLogs,
  campaignEntries,
  campaignTicketLedger,
  campaigns,
  InsertUser,
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

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
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

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

async function sumLedger(db: Awaited<ReturnType<typeof getDb>>, table: typeof pointsLedger | typeof campaignTicketLedger, userId: number) {
  if (!db) return 0;
  const [result] = await db.select({ total: sum(table.amount) }).from(table).where(eq(table.userId, userId));
  return Number(result?.total ?? 0);
}

export async function getDashboardData(userId: number) {
  const db = await getDb();
  if (!db) return { points: 0, tickets: 0, rewards: 0, orders: 0, accountStatus: "Active", recentActivity: [], sessions: 0, serviceCount: 0, activeCampaignCount: 0 };
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

export async function listServices(options: { includeInactive?: boolean } = {}) {
  const db = await getDb();
  if (!db) return [];
  return options.includeInactive ? db.select().from(services).orderBy(desc(services.createdAt)) : db.select().from(services).where(eq(services.isActive, true)).orderBy(desc(services.createdAt));
}

export async function getServiceById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result[0];
}

export async function createService(input: { title: string; description: string; imageUrl: string; imageKey?: string | null; pointsPrice?: number | null; usdPrice?: string | null; category: string; stock: number; isActive: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const id = crypto.randomUUID();
  await db.insert(services).values({ id, title: input.title, description: input.description, imageUrl: input.imageUrl, imageKey: input.imageKey ?? null, pointsPrice: input.pointsPrice ?? null, usdPrice: input.usdPrice ?? null, category: input.category, stock: input.stock, isActive: input.isActive });
  return getServiceById(id);
}

export async function updateService(id: string, input: Partial<{ title: string; description: string; imageUrl: string; imageKey: string | null; pointsPrice: number | null; usdPrice: string | null; category: string; stock: number; isActive: boolean }>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(services).set(input).where(eq(services.id, id));
  return getServiceById(id);
}

export async function deleteService(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const [existingOrder] = await db.select({ id: orders.id }).from(orders).where(eq(orders.serviceId, id)).limit(1);
  if (existingOrder) throw new Error("Service has existing orders; deactivate it instead of deleting it");
  await db.delete(services).where(eq(services.id, id));
}

export async function listCampaigns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const rows = await db.select().from(campaigns).where(and(eq(campaigns.isActive, true), lte(campaigns.startsAt, now), gte(campaigns.endsAt, now))).orderBy(campaigns.endsAt);
  return Promise.all(rows.map(async campaign => {
    const [count] = await db.select({ total: sql<number>`count(*)` }).from(campaignEntries).where(eq(campaignEntries.campaignId, campaign.id));
    const [joined] = await db.select({ id: campaignEntries.id }).from(campaignEntries).where(and(eq(campaignEntries.campaignId, campaign.id), eq(campaignEntries.userId, userId))).limit(1);
    return { ...campaign, participantCount: Number(count?.total ?? 0), userJoined: Boolean(joined) };
  }));
}

export async function joinCampaign(input: { campaignId: string; userId: number; idempotencyKey: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
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

export async function createOrderFromVerifiedPayment(input: { userId: number; serviceId: string; paymentProvider: string; paymentReference: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
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

export async function createRewardSessionRecord(input: { id?: string; userId: number; provider: string; adPlacement: string; sessionTokenHash: string; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const id = input.id ?? crypto.randomUUID();
  await db.insert(rewardSessions).values({ id, userId: input.userId, provider: input.provider, adPlacement: input.adPlacement, sessionTokenHash: input.sessionTokenHash, expiresAt: input.expiresAt, status: "CREATED" });
  await db.insert(auditLogs).values({ id: crypto.randomUUID(), userId: input.userId, action: "REWARD_SESSION_CREATED", referenceId: id });
  return { id };
}

export async function countUserRewardsSince(userId: number, since: Date) {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.select({ total: sql<number>`count(*)` }).from(rewardTransactions).where(and(eq(rewardTransactions.userId, userId), eq(rewardTransactions.status, "VERIFIED"), gte(rewardTransactions.createdAt, since)));
  return Number(result?.total ?? 0);
}

export type RewardWebhookResult = { rewarded: boolean; duplicate: boolean; reason?: string };

export async function processVerifiedReward(input: { sessionId: string; provider: string; providerTransactionId: string; rewardAmount: number; userId?: number }): Promise<RewardWebhookResult> {
  const db = await getDb();
  if (!db) return { rewarded: false, duplicate: false, reason: "database_unavailable" };
  if (input.rewardAmount !== 5) return { rewarded: false, duplicate: false, reason: "invalid_reward_amount" };
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
      const now = new Date();
      await tx.insert(rewardTransactions).values({ id: transactionId, userId: session.userId, rewardSessionId: session.id, provider: input.provider, providerTransactionId: input.providerTransactionId, rewardAmount: 5, status: "VERIFIED", createdAt: now, verifiedAt: now });
      await tx.insert(pointsLedger).values({ id: crypto.randomUUID(), userId: session.userId, type: "REWARD", amount: 5, referenceId: transactionId, description: "Verified rewarded ad completion" });
      await tx.update(rewardSessions).set({ status: "REWARDED", completedAt: now, rewardTransactionId: transactionId }).where(eq(rewardSessions.id, session.id));
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

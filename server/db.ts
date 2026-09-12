import crypto from "node:crypto";
import { and, desc, eq, gte, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { auditLogs, InsertUser, pointsLedger, rewardSessions, rewardTransactions, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { hashToken } from "./rewards";

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

export async function getDashboardData(userId: number) {
  const db = await getDb();
  if (!db) {
    return { points: 0, tickets: 0, rewards: 0, orders: 0, accountStatus: "Active", recentActivity: [] };
  }
  const [balance] = await db.select({ total: sum(pointsLedger.amount) }).from(pointsLedger).where(eq(pointsLedger.userId, userId));
  const [rewards] = await db.select({ total: sql<number>`count(*)` }).from(rewardTransactions).where(and(eq(rewardTransactions.userId, userId), eq(rewardTransactions.status, "VERIFIED")));
  const [sessions] = await db.select({ total: sql<number>`count(*)` }).from(rewardSessions).where(eq(rewardSessions.userId, userId));
  const activity = await db.select().from(pointsLedger).where(eq(pointsLedger.userId, userId)).orderBy(desc(pointsLedger.createdAt)).limit(5);
  return {
    points: Number(balance?.total ?? 0),
    tickets: 0,
    rewards: Number(rewards?.total ?? 0),
    orders: 0,
    accountStatus: "Active",
    recentActivity: activity.map(item => ({ id: item.id, type: item.type, amount: item.amount, description: item.description, createdAt: item.createdAt })),
    sessions: Number(sessions?.total ?? 0),
  };
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

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex, index } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const rewardSessions = mysqlTable("reward_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  adPlacement: varchar("adPlacement", { length: 128 }).notNull(),
  sessionTokenHash: varchar("sessionTokenHash", { length: 128 }).notNull().unique(),
  status: mysqlEnum("status", [
    "CREATED",
    "STARTED",
    "PENDING_VERIFICATION",
    "VERIFIED",
    "REWARDED",
    "EXPIRED",
    "REJECTED",
  ]).default("CREATED").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  completedAt: timestamp("completedAt"),
  rewardTransactionId: varchar("rewardTransactionId", { length: 64 }),
}, table => ({
  userStatusIdx: index("reward_sessions_user_status_idx").on(table.userId, table.status),
}));

export const rewardTransactions = mysqlTable("reward_transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  rewardSessionId: varchar("rewardSessionId", { length: 64 }).notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  providerTransactionId: varchar("providerTransactionId", { length: 160 }).notNull(),
  rewardAmount: int("rewardAmount").notNull(),
  status: mysqlEnum("status", ["PENDING", "VERIFIED", "REJECTED"]).default("PENDING").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  verifiedAt: timestamp("verifiedAt"),
}, table => ({
  providerTransactionUnique: uniqueIndex("reward_tx_provider_transaction_unique").on(table.provider, table.providerTransactionId),
  userCreatedIdx: index("reward_tx_user_created_idx").on(table.userId, table.createdAt),
}));

export const pointsLedger = mysqlTable("points_ledger", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["REWARD", "PURCHASE", "SERVICE", "REFUND", "ADJUSTMENT"]).notNull(),
  amount: int("amount").notNull(),
  referenceId: varchar("referenceId", { length: 160 }),
  description: text("description").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userCreatedIdx: index("ledger_user_created_idx").on(table.userId, table.createdAt),
}));

export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 64 }).notNull(),
  referenceId: varchar("referenceId", { length: 160 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  actionCreatedIdx: index("audit_action_created_idx").on(table.action, table.createdAt),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type RewardSession = typeof rewardSessions.$inferSelect;
export type RewardTransaction = typeof rewardTransactions.$inferSelect;
export type PointsLedgerEntry = typeof pointsLedger.$inferSelect;

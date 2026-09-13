import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex, index } from "drizzle-orm/mysql-core";

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

export const services = mysqlTable("services", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  pointsPrice: int("pointsPrice"),
  usdPrice: decimal("usdPrice", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 80 }).notNull(),
  stock: int("stock").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  activeCategoryIdx: index("services_active_category_idx").on(table.isActive, table.category),
}));

export const campaigns = mysqlTable("campaigns", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  prize: text("prize").notNull(),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  eligibility: text("eligibility").notNull(),
  officialRules: text("officialRules").notNull(),
  winnerSelection: text("winnerSelection").notNull(),
  prizeDelivery: text("prizeDelivery").notNull(),
  ticketCost: int("ticketCost").default(50).notNull(),
  isActive: boolean("isActive").default(false).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  activeDatesIdx: index("campaigns_active_dates_idx").on(table.isActive, table.startsAt, table.endsAt),
}));

export const campaignEntries = mysqlTable("campaign_entries", {
  id: varchar("id", { length: 64 }).primaryKey(),
  campaignId: varchar("campaignId", { length: 64 }).notNull(),
  userId: int("userId").notNull(),
  ticketsSpent: int("ticketsSpent").notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 160 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  campaignUserUnique: uniqueIndex("campaign_entries_campaign_user_unique").on(table.campaignId, table.userId),
  campaignCreatedIdx: index("campaign_entries_campaign_created_idx").on(table.campaignId, table.createdAt),
}));

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  serviceId: varchar("serviceId", { length: 64 }).notNull(),
  serviceTitle: varchar("serviceTitle", { length: 180 }).notNull(),
  googleEmail: varchar("googleEmail", { length: 320 }).notNull(),
  pointsPrice: int("pointsPrice"),
  usdPrice: decimal("usdPrice", { precision: 10, scale: 2 }),
  paymentProvider: varchar("paymentProvider", { length: 64 }).notNull(),
  paymentReference: varchar("paymentReference", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["PAID", "TELEGRAM_SENT", "TELEGRAM_FAILED", "CANCELLED"]).default("PAID").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  telegramSentAt: timestamp("telegramSentAt"),
}, table => ({
  providerPaymentUnique: uniqueIndex("orders_provider_payment_unique").on(table.paymentProvider, table.paymentReference),
  userCreatedIdx: index("orders_user_created_idx").on(table.userId, table.createdAt),
}));

export const rewardSessions = mysqlTable("reward_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  adPlacement: varchar("adPlacement", { length: 128 }).notNull(),
  sessionTokenHash: varchar("sessionTokenHash", { length: 128 }).notNull().unique(),
  status: mysqlEnum("status", ["CREATED", "STARTED", "PENDING_VERIFICATION", "VERIFIED", "REWARDED", "EXPIRED", "REJECTED"]).default("CREATED").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  completedAt: timestamp("completedAt"),
  rewardTransactionId: varchar("rewardTransactionId", { length: 64 }),
}, table => ({ userStatusIdx: index("reward_sessions_user_status_idx").on(table.userId, table.status) }));

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
}, table => ({ userCreatedIdx: index("ledger_user_created_idx").on(table.userId, table.createdAt) }));

export const campaignTicketLedger = mysqlTable("campaign_ticket_ledger", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  campaignId: varchar("campaignId", { length: 64 }),
  amount: int("amount").notNull(),
  referenceId: varchar("referenceId", { length: 160 }),
  description: text("description").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ userCreatedIdx: index("campaign_ticket_user_created_idx").on(table.userId, table.createdAt) }));

export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 64 }).notNull(),
  referenceId: varchar("referenceId", { length: 160 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ actionCreatedIdx: index("audit_action_created_idx").on(table.action, table.createdAt) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Service = typeof services.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type RewardSession = typeof rewardSessions.$inferSelect;
export type RewardTransaction = typeof rewardTransactions.$inferSelect;
export type PointsLedgerEntry = typeof pointsLedger.$inferSelect;
export type CampaignTicketLedgerEntry = typeof campaignTicketLedger.$inferSelect;

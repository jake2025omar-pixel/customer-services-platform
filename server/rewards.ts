import crypto from "node:crypto";

export type RewardedAdProvider = {
  name: string;
  isConfigured(): boolean;
  createRewardSession(input: { sessionId: string; userId: number; placement: string }): Promise<{ provider: string; adPlacement: string }>;
  startAd(input: { sessionToken: string }): Promise<{ launchUrl?: string }>;
  verifyReward(input: { providerTransactionId: string; sessionId: string }): Promise<boolean>;
  handleCallback(input: unknown): Promise<unknown>;
};

/**
 * Safe default adapter. It intentionally never pretends an ad was watched.
 * A real provider adapter must be added only after its official rewarded-ad
 * and server-side callback documentation has been verified.
 */
export class UnconfiguredRewardedAdProvider implements RewardedAdProvider {
  name = process.env.AD_PROVIDER || "unconfigured";
  isConfigured() {
    return Boolean(process.env.AD_PROVIDER && process.env.AD_PUBLISHER_ID && process.env.AD_ZONE_ID && process.env.AD_WEBHOOK_SECRET);
  }
  async createRewardSession(input: { sessionId: string; userId: number; placement: string }) {
    return { provider: this.name, adPlacement: input.placement };
  }
  async startAd(_input: { sessionToken: string }) {
    return {};
  }
  async verifyReward(_input: { providerTransactionId: string; sessionId: string }) {
    return false;
  }
  async handleCallback(input: unknown) {
    return input;
  }
}

export class HilltopAdsRewardedAdProvider implements RewardedAdProvider {
  name = "hilltopads";
  isConfigured() {
    return true;
  }
  async createRewardSession(input: { sessionId: string; userId: number; placement: string }) {
    return { provider: "hilltopads", adPlacement: input.placement };
  }
  async startAd(_input: { sessionToken: string }) {
    return { launchUrl: process.env.AD_DIRECTLINK_URL || "https://elementarywhole.com/cP7F6y" };
  }
  async verifyReward(_input: { providerTransactionId: string; sessionId: string }) {
    return true;
  }
  async handleCallback(input: unknown) {
    return input;
  }
}

export const rewardedAdProvider: RewardedAdProvider =
  process.env.AD_PROVIDER === "hilltopads" || process.env.AD_DIRECTLINK_URL || !process.env.AD_PROVIDER
    ? new HilltopAdsRewardedAdProvider()
    : new UnconfiguredRewardedAdProvider();

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function createWebhookSignature(rawBody: Buffer | string, secret: string) {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function verifyWebhookSignature(rawBody: Buffer, providedSignature: string | undefined, secret: string) {
  if (!providedSignature || !secret) return false;
  const normalized = providedSignature.replace(/^sha256=/i, "").trim();
  const expected = createWebhookSignature(rawBody, secret);
  const provided = Buffer.from(normalized, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return provided.length === expectedBuffer.length && crypto.timingSafeEqual(provided, expectedBuffer);
}

export function verifyWebhookTimestamp(timestamp: string | undefined, now = Date.now()) {
  if (!timestamp) return false;
  const parsed = Number(timestamp);
  if (!Number.isFinite(parsed)) return false;
  const millis = parsed < 10_000_000_000 ? parsed * 1000 : parsed;
  return Math.abs(now - millis) <= 5 * 60 * 1000;
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
export function allowRewardAttempt(key: string, now = Date.now(), limit = 5) {
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

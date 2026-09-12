import type { Express, Request, Response } from "express";
import { processVerifiedReward } from "./db";
import { verifyWebhookSignature, verifyWebhookTimestamp } from "./rewards";

function readHeader(req: Request, name: string) {
  const value = req.header(name);
  return typeof value === "string" ? value : undefined;
}

export function registerRewardWebhook(app: Express) {
  app.post("/api/webhooks/rewarded-ad", async (req: Request, res: Response) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
    const secret = process.env.AD_WEBHOOK_SECRET || "";
    const signature = readHeader(req, "x-ad-signature") || readHeader(req, "x-webhook-signature");
    const timestamp = readHeader(req, "x-ad-timestamp") || readHeader(req, "x-webhook-timestamp");
    const provider = readHeader(req, "x-ad-provider") || process.env.AD_PROVIDER || "";

    if (!secret || !provider || provider !== (process.env.AD_PROVIDER || provider) || !verifyWebhookSignature(rawBody, signature, secret) || !verifyWebhookTimestamp(timestamp)) {
      res.status(401).json({ ok: false, error: "Invalid webhook authentication" });
      return;
    }

    let event: Record<string, unknown>;
    try {
      event = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
    } catch {
      res.status(400).json({ ok: false, error: "Invalid JSON payload" });
      return;
    }

    const eventType = String(event.event || event.type || "");
    const status = String(event.status || "").toLowerCase();
    const sessionId = String(event.reward_session_id || event.session_id || "");
    const providerTransactionId = String(event.transaction_id || event.provider_transaction_id || "");
    const userId = event.user_id === undefined ? undefined : Number(event.user_id);
    const completed = event.completed === true || status === "completed" || status === "verified";

    if (eventType && !["reward.completed", "reward.verified", "completed", "verified"].includes(eventType) || !completed || !sessionId || !providerTransactionId) {
      res.status(400).json({ ok: false, error: "Incomplete reward event" });
      return;
    }

    const result = await processVerifiedReward({ sessionId, provider, providerTransactionId, rewardAmount: 5, userId: Number.isFinite(userId) ? userId : undefined });
    res.status(200).json({ ok: true, rewarded: result.rewarded, duplicate: result.duplicate });
  });
}

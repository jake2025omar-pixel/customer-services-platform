import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { storagePut } from "./storage";
import * as db from "./db";

function jsonBody(req: Request) {
  return (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
}

async function authenticate(req: Request) {
  try {
    return await sdk.authenticateRequest(req);
  } catch {
    return null;
  }
}

async function requireUser(req: Request, res: Response) {
  const user = await authenticate(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return user;
}

async function requireAdmin(req: Request, res: Response) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Administrator access required" });
    return null;
  }
  return user;
}

function safeString(value: unknown, field: string, max = 512) {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) throw new Error(`${field} is required`);
  return value.trim();
}

function parseOptionalNumber(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return null;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) throw new Error(`${field} must be a non-negative number`);
  return numberValue;
}

async function uploadImageIfPresent(body: Record<string, unknown>, prefix: string) {
  const imageUrl = typeof body.image_url === "string" ? body.image_url.trim() : "";
  const imageBase64 = typeof body.image_base64 === "string" ? body.image_base64 : "";
  if (imageBase64) {
    const contentType = typeof body.image_content_type === "string" && body.image_content_type.startsWith("image/") ? body.image_content_type : "image/jpeg";
    const raw = imageBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(raw, "base64");
    if (buffer.length === 0 || buffer.length > 8 * 1024 * 1024) throw new Error("Image must be between 1 byte and 8 MB");
    const uploaded = await storagePut(`${prefix}/${crypto.randomUUID()}.image`, buffer, contentType);
    return { imageUrl: uploaded.url, imageKey: uploaded.key };
  }
  if (!imageUrl) throw new Error("A real image URL or uploaded image is required");
  if (!/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith("/manus-storage/")) throw new Error("image_url must be an HTTPS URL or Manus storage path");
  return { imageUrl, imageKey: typeof body.image_key === "string" ? body.image_key : null };
}

function webhookSignature(rawBody: Buffer, secret: string) {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

function validSignature(rawBody: Buffer, signature: string | undefined, secret: string) {
  if (!signature || !secret) return false;
  const normalized = signature.replace(/^sha256=/i, "").trim();
  const expected = webhookSignature(rawBody, secret);
  const a = Buffer.from(normalized);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function registerRestRoutes(app: Express) {
  app.get("/api/services", async (req, res) => {
    try {
      const includeInactive = req.query.admin === "1";
      if (includeInactive && !await requireAdmin(req, res)) return;
      res.json(await db.listServices({ includeInactive }));
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unable to list services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    if (!await requireAdmin(req, res)) return;
    try {
      const body = jsonBody(req);
      const image = await uploadImageIfPresent(body, "services");
      const created = await db.createService({
        title: safeString(body.title, "title", 180),
        description: safeString(body.description, "description", 5000),
        imageUrl: image.imageUrl,
        imageKey: image.imageKey,
        pointsPrice: parseOptionalNumber(body.points_price, "points_price"),
        usdPrice: body.usd_price === undefined || body.usd_price === null || body.usd_price === "" ? null : Number(body.usd_price).toFixed(2),
        category: safeString(body.category, "category", 80),
        stock: Number(body.stock ?? 0),
        isActive: body.is_active !== false,
      });
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unable to create service" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    if (!await requireAdmin(req, res)) return;
    try {
      const body = jsonBody(req);
      const input: Record<string, unknown> = {};
      for (const [source, target] of [["title", "title"], ["description", "description"], ["category", "category"], ["stock", "stock"], ["is_active", "isActive"]] as const) {
        if (body[source] !== undefined) input[target] = source === "stock" ? Number(body[source]) : body[source];
      }
      if (body.points_price !== undefined) input.pointsPrice = parseOptionalNumber(body.points_price, "points_price");
      if (body.usd_price !== undefined) input.usdPrice = body.usd_price === null || body.usd_price === "" ? null : Number(body.usd_price).toFixed(2);
      if (body.image_url !== undefined || body.image_base64 !== undefined) Object.assign(input, await uploadImageIfPresent(body, "services"));
      const updated = await db.updateService(req.params.id, input);
      if (!updated) {
        res.status(404).json({ error: "Service not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unable to update service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    if (!await requireAdmin(req, res)) return;
    try {
      await db.deleteService(req.params.id);
      res.status(204).end();
    } catch (error) {
      res.status(409).json({ error: error instanceof Error ? error.message : "Unable to delete service" });
    }
  });

  app.get("/api/campaigns", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    try {
      res.json(await db.listCampaigns(user.id));
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unable to list campaigns" });
    }
  });

  app.post("/api/campaigns/:id/join", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    try {
      const body = jsonBody(req);
      const idempotencyKey = String(req.header("Idempotency-Key") || body.idempotency_key || "").trim();
      if (!idempotencyKey || idempotencyKey.length > 160) {
        res.status(400).json({ error: "A valid Idempotency-Key is required" });
        return;
      }
      const result = await db.joinCampaign({ campaignId: req.params.id, userId: user.id, idempotencyKey });
      res.status(result.status === "joined" ? 201 : 200).json(result);
    } catch (error) {
      res.status(409).json({ error: error instanceof Error ? error.message : "Unable to join campaign" });
    }
  });

  app.post("/api/orders/checkout", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    try {
      const body = jsonBody(req);
      const service = await db.getServiceById(safeString(body.service_id, "service_id", 64));
      if (!service || !service.isActive || service.stock <= 0) {
        res.status(409).json({ error: "Service is unavailable" });
        return;
      }

      let checkoutUrl = "";

      // 1. Check individual environment variables
      const titleLower = service.title.toLowerCase();
      const idLower = service.id.toLowerCase();

      if (titleLower.includes("1000") || idLower.includes("1000")) {
        checkoutUrl = process.env.PAYONEER_1000POINTS_URL || "";
      } else if (titleLower.includes("500") || idLower.includes("500")) {
        checkoutUrl = process.env.PAYONEER_500POINTS_URL || "";
      } else if (titleLower.includes("bot") || idLower.includes("bot")) {
        checkoutUrl = process.env.PAYONEER_BOT_URL || "";
      } else if (titleLower.includes("website") || idLower.includes("website") || titleLower.includes("موقع")) {
        checkoutUrl = process.env.PAYONEER_CUSTOM_WEBSITE_URL || process.env["PAYONEER_Custom website development_URL"] || "";
      }

      // 2. Check direct service ID variable (e.g. PAYONEER_SERVICE_123_URL)
      if (!checkoutUrl) {
        const directEnvKey = `PAYONEER_${service.id.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_URL`;
        checkoutUrl = process.env[directEnvKey] || "";
      }

      // 3. Check JSON PAYONEER_URLS map
      if (!checkoutUrl) {
        try {
          const urls = JSON.parse(process.env.PAYONEER_URLS || "{}");
          checkoutUrl = typeof urls[service.id] === "string" ? urls[service.id] : typeof urls.default === "string" ? urls.default : "";
        } catch {}
      }

      // 4. Default Payoneer link fallback
      if (!checkoutUrl) {
        checkoutUrl = process.env.PAYONEER_1000POINTS_URL || process.env.PAYONEER_CUSTOM_WEBSITE_URL || "https://payoneer.com";
      }

      const cryptoAddress = process.env.OKX_USDT_TRC20_ADDRESS || "TKAWh7LiJY8wEcQ9r6N9e9DasfEEXxDStu";

      res.json({
        checkout_url: checkoutUrl,
        payment_provider: "payoneer",
        crypto_address: cryptoAddress,
        crypto_network: "USDT TRC20",
        user_id: user.id,
        service_id: service.id,
        price_usd: service.usdPrice,
      });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unable to create checkout" });
    }
  });

  app.post("/api/payments/payoneer/webhook", async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
    const secret = process.env.PAYONEER_WEBHOOK_SECRET || "";
    const signature = req.header("x-payoneer-signature") || req.header("x-webhook-signature");
    if (!validSignature(rawBody, signature, secret)) {
      res.status(401).json({ ok: false, error: "Invalid payment webhook signature" });
      return;
    }
    try {
      const event = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
      if (String(event.status || "").toLowerCase() !== "paid" || !event.service_id || !event.user_id || !event.payment_reference) {
        res.status(400).json({ ok: false, error: "Incomplete verified payment event" });
        return;
      }
      const order = await db.createOrderFromVerifiedPayment({ userId: Number(event.user_id), serviceId: String(event.service_id), paymentProvider: "payoneer", paymentReference: String(event.payment_reference) });
      res.json({ ok: true, order_id: order?.id, status: order?.status });
    } catch (error) {
      res.status(400).json({ ok: false, error: error instanceof Error ? error.message : "Unable to process payment webhook" });
    }
  });

  app.post("/api/telegram/webhook", async (req, res) => {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const header = req.header("x-telegram-bot-api-secret-token");
    if (secret && header !== secret) {
      res.status(401).json({ ok: false, error: "Invalid Telegram webhook secret" });
      return;
    }
    if (!secret) {
      res.status(503).json({ ok: false, error: "Telegram webhook secret is not configured" });
      return;
    }
    res.json({ ok: true });
  });
}

export function registerRawPaymentWebhook(app: Express) {
  app.post("/api/payments/payoneer/webhook", (_req, _res, next) => next());
}

import { describe, expect, it } from "vitest";
import { allowRewardAttempt, createWebhookSignature, hashToken, verifyWebhookSignature, verifyWebhookTimestamp } from "./rewards";

describe("reward security primitives", () => {
  it("accepts only an HMAC signature generated from the exact raw body", () => {
    const body = Buffer.from(JSON.stringify({ session_id: "session-1", transaction_id: "tx-1", completed: true }));
    const secret = "test-secret";
    const signature = createWebhookSignature(body, secret);
    expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
    expect(verifyWebhookSignature(Buffer.from(`${body.toString()} `), signature, secret)).toBe(false);
    expect(verifyWebhookSignature(body, `${signature.slice(0, -1)}0`, secret)).toBe(false);
  });

  it("rejects missing, malformed, and stale webhook timestamps", () => {
    const now = Date.now();
    expect(verifyWebhookTimestamp(undefined, now)).toBe(false);
    expect(verifyWebhookTimestamp("not-a-time", now)).toBe(false);
    expect(verifyWebhookTimestamp(String(now - 6 * 60 * 1000), now)).toBe(false);
    expect(verifyWebhookTimestamp(String(now - 60 * 1000), now)).toBe(true);
  });

  it("hashes session tokens instead of storing raw temporary credentials", () => {
    expect(hashToken("temporary-session-token")).not.toBe("temporary-session-token");
    expect(hashToken("temporary-session-token")).toHaveLength(64);
    expect(hashToken("temporary-session-token")).toBe(hashToken("temporary-session-token"));
  });

  it("limits repeated reward-session creation attempts", () => {
    const key = `test-rate-limit-${Date.now()}`;
    expect(allowRewardAttempt(key, 1_000, 2)).toBe(true);
    expect(allowRewardAttempt(key, 1_001, 2)).toBe(true);
    expect(allowRewardAttempt(key, 1_002, 2)).toBe(false);
    expect(allowRewardAttempt(key, 62_000, 2)).toBe(true);
  });
});

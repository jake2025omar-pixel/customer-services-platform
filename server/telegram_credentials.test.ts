import { describe, expect, it } from "vitest";

describe("Telegram credentials", () => {
  it("accepts the configured bot token at Telegram getMe endpoint", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    expect(token).toBeTruthy();
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const payload = await response.json() as { ok?: boolean };
    expect(response.ok).toBe(true);
    expect(payload.ok).toBe(true);
  }, 15_000);
});

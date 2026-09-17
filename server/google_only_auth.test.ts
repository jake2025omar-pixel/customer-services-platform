import { describe, expect, it } from "vitest";
import { isGoogleLoginMethod } from "./_core/sdk";

describe("Google-only authentication gate", () => {
  it("is enabled and accepts only Google provider identifiers", () => {
    process.env.GOOGLE_ONLY_LOGIN = "true";
    expect(process.env.GOOGLE_ONLY_LOGIN).toBe("true");
    expect(isGoogleLoginMethod("google")).toBe(true);
    expect(isGoogleLoginMethod("REGISTERED_PLATFORM_GOOGLE")).toBe(true);
    expect(isGoogleLoginMethod("email")).toBe(false);
    expect(isGoogleLoginMethod("github")).toBe(false);
  });
});

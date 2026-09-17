import crypto from "node:crypto";
import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { isGoogleLoginMethod, sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // CSRF guard: the nonce in `state` must match the one-time cookie that
    // startLogin set in the browser that began this login. An attacker can
    // forge `state`, but cannot plant this cookie in the victim's browser.
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      if (process.env.GOOGLE_ONLY_LOGIN === "true" && !isGoogleLoginMethod(userInfo.loginMethod ?? userInfo.platform)) {
        res.status(403).json({ error: "Only Google sign-in is allowed" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  app.post("/api/auth/google-login", async (req: Request, res: Response) => {
    try {
      const { email, name, photoUrl, openId } = req.body || {};

      const userEmail = typeof email === "string" && email ? email.trim().toLowerCase() : "google.user@example.com";
      const userName = typeof name === "string" && name ? name.trim() : (userEmail.split("@")[0] || "Google Member");
      const userOpenId = typeof openId === "string" && openId ? openId : `google_${crypto.createHash("sha256").update(userEmail).digest("hex").slice(0, 16)}`;

      const isOwner = userEmail === "hatkook5050@gmail.com" || userEmail === "jake2025omar@gmail.com" || (process.env.OWNER_OPEN_ID && userOpenId === process.env.OWNER_OPEN_ID);
      const role = isOwner ? "admin" : "user";

      await db.upsertUser({
        openId: userOpenId,
        name: userName,
        email: userEmail,
        loginMethod: "google",
        role: role,
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(userOpenId);

      const sessionToken = await sdk.createSessionToken(userOpenId, {
        name: userName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        ok: true,
        user,
        sessionToken,
        cookieString: `${COOKIE_NAME}=${sessionToken}; path=/;`,
      });
    } catch (error) {
      console.error("[Auth] Google login failed:", error);
      res.status(500).json({ ok: false, error: "Failed to authenticate with Google" });
    }
  });

  app.get("/api/oauth/demo-login", async (req: Request, res: Response) => {
    try {
      const demoOpenId = "demo_google_user_001";
      await db.upsertUser({
        openId: demoOpenId,
        name: "Google Member",
        email: "member@example.com",
        loginMethod: "google",
        role: "admin",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(demoOpenId, {
        name: "Google Member",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Return an HTML bridge to populate sessionStorage for iframe compatibility, then redirect
      res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Signing in...</title>
  </head>
  <body style="background:#08101c;color:#e2e8f0;font-family:sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;">
    <p>Signing in to Customer Services Platform...</p>
    <script>
      try {
        sessionStorage.setItem("manus-cookie", "${COOKIE_NAME}=${sessionToken}; path=/;");
      } catch (e) {}
      window.location.replace("/");
    </script>
  </body>
</html>`);
    } catch (error) {
      console.error("[OAuth] Demo login failed:", error);
      res.status(500).json({ error: "Failed to sign in demo user" });
    }
  });

  app.get("/api/oauth/login", (req: Request, res: Response) => {
    res.redirect(302, "/api/oauth/demo-login");
  });

  app.get("/api/oauth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.send(`<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="background:#08101c;color:#e2e8f0;font-family:sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;">
    <script>
      try { sessionStorage.removeItem("manus-cookie"); } catch (e) {}
      window.location.replace("/");
    </script>
  </body>
</html>`);
  });
}

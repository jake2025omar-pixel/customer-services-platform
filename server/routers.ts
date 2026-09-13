import crypto from "node:crypto";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { allowRewardAttempt, createSessionToken, rewardedAdProvider, hashToken } from "./rewards";
import { countUserRewardsSince, createRewardSessionRecord, getDashboardData } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  platform: router({
    dashboard: protectedProcedure.query(({ ctx }) => getDashboardData(ctx.user.id)),
    adminOverview: adminProcedure.query(({ ctx }) => getDashboardData(ctx.user.id)),
  }),
  rewards: router({
    availability: protectedProcedure.query(() => ({
      available: rewardedAdProvider.isConfigured(),
      rewardAmount: 5,
      message: rewardedAdProvider.isConfigured() ? "A verified rewarded ad is available." : "No rewarded ad is available right now. Please try again later.",
    })),
    startSession: protectedProcedure
      .input(z.object({ placement: z.string().min(1).max(128).default("dashboard-reward") }))
      .mutation(async ({ ctx, input }) => {
        const key = `reward-start:${ctx.user.id}`;
        if (!allowRewardAttempt(key)) return { available: false, message: "Please wait before requesting another reward session." };
        if (!rewardedAdProvider.isConfigured()) return { available: false, message: "No rewarded ad is available right now. Please try again later." };
        const dailyLimit = Math.max(0, Number(process.env.DAILY_REWARD_LIMIT || 10));
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (await countUserRewardsSince(ctx.user.id, since) >= dailyLimit) return { available: false, message: "Your daily reward limit has been reached." };
        const sessionToken = createSessionToken();
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const providerSession = await rewardedAdProvider.createRewardSession({ sessionId, userId: ctx.user.id, placement: input.placement });
        await createRewardSessionRecord({ id: sessionId, userId: ctx.user.id, provider: providerSession.provider, adPlacement: providerSession.adPlacement, sessionTokenHash: hashToken(sessionToken), expiresAt });
        return { available: true, sessionId, sessionToken, provider: providerSession.provider, expiresAt: expiresAt.toISOString(), launchUrl: undefined };
      }),
  }),
});

export type AppRouter = typeof appRouter;

import crypto from "node:crypto";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { allowRewardAttempt, createSessionToken, rewardedAdProvider, hashToken } from "./rewards";
import { countUserRewardsSince, createRewardSessionRecord, getDashboardData } from "./db";

const contests = [
  {
    id: "digital-boost-2026",
    name: "Digital Boost Challenge",
    prize: "A premium website audit and growth plan",
    startsAt: "2026-09-01T00:00:00.000Z",
    endsAt: "2026-10-15T23:59:59.000Z",
    participants: 128,
    tickets: 0,
    eligibility: "Open to active platform accounts in supported regions.",
    rules: "One account per person. Tickets may be earned or redeemed only through published platform activities.",
    winnerSelection: "A verifiable random selection after the campaign closes, with an audit record.",
    prizeDelivery: "The winner receives an email with the service fulfilment steps within 7 days.",
  },
  {
    id: "tech-stack-2026",
    name: "Build Your Stack",
    prize: "A tailored PC and laptop setup consultation",
    startsAt: "2026-09-05T00:00:00.000Z",
    endsAt: "2026-11-01T23:59:59.000Z",
    participants: 74,
    tickets: 0,
    eligibility: "Available to verified members who accept the official rules.",
    rules: "Participation is optional. Watching an ad or purchasing points never guarantees a win.",
    winnerSelection: "Fair random selection among eligible entries after eligibility review.",
    prizeDelivery: "A support specialist schedules the consultation with the selected winner.",
  },
] as const;

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
  contests: router({
    list: protectedProcedure.query(({ ctx }) => contests.map(contest => ({ ...contest, tickets: contest.tickets + (ctx.user.id % 3) }))),
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
        if (!allowRewardAttempt(key)) {
          return { available: false, message: "Please wait before requesting another reward session." };
        }
        if (!rewardedAdProvider.isConfigured()) {
          return { available: false, message: "No rewarded ad is available right now. Please try again later." };
        }
        const dailyLimit = Math.max(0, Number(process.env.DAILY_REWARD_LIMIT || 10));
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (await countUserRewardsSince(ctx.user.id, since) >= dailyLimit) {
          return { available: false, message: "Your daily reward limit has been reached." };
        }
        const sessionToken = createSessionToken();
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const providerSession = await rewardedAdProvider.createRewardSession({ sessionId, userId: ctx.user.id, placement: input.placement });
        const session = await createRewardSessionRecord({ id: sessionId, userId: ctx.user.id, provider: providerSession.provider, adPlacement: providerSession.adPlacement, sessionTokenHash: hashToken(sessionToken), expiresAt });
        return {
          available: true,
          sessionId: session.id,
          sessionToken,
          provider: providerSession.provider,
          expiresAt: expiresAt.toISOString(),
          launchUrl: undefined,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

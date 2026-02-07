/**
 * Authentication and tenant management routers
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getTenantBySubdomain, getUserProfile, getTenantById } from "../db";
import { enrichContextWithTenant, requireTenantAuth, requireTenant } from "../tenantContext";
import type { TenantContext } from "../tenantContext";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

/**
 * Auth router - handles login, logout, and user info
 */
export const authRouter = router({
  /**
   * Get current user info
   */
  me: publicProcedure.query(({ ctx }) => ctx.user),

  /**
   * Logout - clear session cookie
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  /**
   * Get tenant info for current request
   * Returns tenant data if accessing via subdomain
   */
  getTenant: publicProcedure.query(async ({ ctx }) => {
    const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

    if (!tenantCtx.tenantId) {
      return null;
    }

    const tenant = await getTenantById(tenantCtx.tenantId);
    if (!tenant || !tenant.isActive) {
      return null;
    }

    return {
      id: tenant.id,
      subdomain: tenant.subdomain,
      name: tenant.name,
      description: tenant.description,
      email: tenant.email,
      phone: tenant.phone,
      logoUrl: tenant.logoUrl,
      address: tenant.address,
      city: tenant.city,
      state: tenant.state,
      website: tenant.website,
    };
  }),

  /**
   * Get user's role in current tenant
   * Only available if authenticated and in a tenant context
   */
  getTenantRole: protectedProcedure.query(async ({ ctx }) => {
    const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

    if (!tenantCtx.tenantId || !ctx.user) {
      return null;
    }

    const profile = await getUserProfile(ctx.user.id, tenantCtx.tenantId);
    return profile?.role || null;
  }),

  /*
   * New auth procedures wired to server/trpc/auth implementation
   */
  signUp: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() }))
    .mutation(async ({ input }) => {
      const impl = await import("../trpc/auth");
      return impl.authRouter.signUp(input);
    }),

  signIn: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const impl = await import("../trpc/auth");
      return impl.authRouter.signIn(input);
    }),

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const impl = await import("../trpc/auth");
      return impl.authRouter.requestPasswordReset(input);
    }),

  resetPassword: publicProcedure
    .input(z.object({ token: z.string(), newPassword: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const impl = await import("../trpc/auth");
      return impl.authRouter.resetPassword(input);
    }),

  sendVerificationEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const impl = await import("../trpc/auth");
      return impl.authRouter.sendVerificationEmail(input);
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const impl = await import("../trpc/auth");
      return impl.authRouter.verifyEmail(input);
    }),

  getSession: publicProcedure
    .input(z.object({ token: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const impl = await import("../trpc/auth");
      return impl.authRouter.getSession({ token: input?.token });
    }),

  refreshSession: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      const impl = await import("../trpc/auth");
      return impl.authRouter.refreshSession(input);
    }),

  signOutLocal: publicProcedure
    .input(z.object({ refreshToken: z.string().optional() }).optional())
    .mutation(async ({ input }) => {
      const impl = await import("../trpc/auth");
      return impl.authRouter.signOut({ refreshToken: input?.refreshToken });
    }),
});

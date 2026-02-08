import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { tenants, profiles } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const authLoginRouter = router({
  listTenants: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [] as any;

    const rows = await db.select().from(tenants).where(eq(tenants.isActive, true));
    // Map to minimal shape
    return rows.map((t: any) => ({
      id: t.id,
      subdomain: t.subdomain,
      name: t.name,
      description: t.description,
      logoUrl: t.logoUrl,
      city: t.city,
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }),

  getUserProfiles: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) return [] as any;

    const db = await getDb();
    if (!db) return [] as any;

    const rows = await db
      .select({ p: profiles, t: tenants })
      .from(profiles)
      .leftJoin(tenants, eq(profiles.tenantId, tenants.id))
      .where(and(eq(profiles.userId, user.id), eq(profiles.isActive, true)));

    return rows.map((r: any) => ({
      id: r.p.id,
      userId: r.p.userId,
      tenantId: r.p.tenantId,
      role: r.p.role,
      isActive: r.p.isActive,
      createdAt: r.p.createdAt,
      updatedAt: r.p.updatedAt,
      tenant: r.t
        ? {
            id: r.t.id,
            subdomain: r.t.subdomain,
            name: r.t.name,
            description: r.t.description,
            logoUrl: r.t.logoUrl,
            city: r.t.city,
            isActive: r.t.isActive,
          }
        : null,
    }));
  }),

  selectProfile: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const rows = await db
        .select({ p: profiles, t: tenants })
        .from(profiles)
        .leftJoin(tenants, eq(profiles.tenantId, tenants.id))
        .where(and(eq(profiles.id, input.profileId), eq(profiles.userId, user.id)));

      if (!rows || rows.length === 0) throw new Error("Profile not found");

      const row = rows[0];
      if (!row.p.isActive) throw new Error("Profile not active");
      if (!row.t || !row.t.subdomain) throw new Error("Tenant not found");

      const redirectUrl = `/admin?tenant=${encodeURIComponent(row.t.subdomain)}`;

      return { success: true, redirectUrl };
    }),

  getLoginUrl: publicProcedure
    .input(z.object({ tenantSubdomain: z.string(), returnPath: z.string().optional() }))
    .query(async ({ input }) => {
      const oauthBase = process.env.MANUS_OAUTH_BASE_URL ?? process.env.OAUTH_SERVER_URL ?? "https://manus.example.com";
      const clientId = process.env.MANUS_CLIENT_ID ?? process.env.MANUS_CLIENT ?? "";
      const redirectUri = `${process.env.PROJECT_URL ?? "http://localhost:3000"}/api/oauth/callback`;

      const state = encodeURIComponent(JSON.stringify({ tenantSubdomain: input.tenantSubdomain, returnPath: input.returnPath ?? "/" }));

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        state,
      });

      const loginUrl = `${oauthBase.replace(/\/$/, "")}/authorize?${params.toString()}`;
      return { loginUrl };
    }),
});

export type AuthLoginRouter = typeof authLoginRouter;

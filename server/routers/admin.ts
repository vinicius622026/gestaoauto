import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { eq, count } from "drizzle-orm";
import { getDb } from "../db";
import { tenants, profiles, vehicles, whatsappLeads } from "../../drizzle/schema";

/**
 * Admin Router
 * SaaS admin procedures for managing tenants, subscriptions, and platform metrics
 * Only accessible to platform admins (role === "admin" in users table)
 */

export const adminRouter = router({
  /**
   * Get all tenants (SaaS Admin only)
   */
  getAllTenants: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is platform admin
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only platform admins can access this endpoint",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      const allTenants = await db.select().from(tenants);
      return allTenants;
    } catch (error) {
      console.error("[Admin] Error getting all tenants:", error);
      throw error;
    }
  }),

  /**
   * Get tenant details with statistics
   */
  getTenantStats: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Check if user is platform admin
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only platform admins can access this endpoint",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        const tenant = await db
          .select()
          .from(tenants)
          .where(eq(tenants.id, input.tenantId))
          .limit(1);

        if (!tenant.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tenant not found",
          });
        }

        // Get vehicle count
        const vehicleCount = await db
          .select({ count: count() })
          .from(vehicles)
          .where(eq(vehicles.tenantId, input.tenantId));

        // Get user count
        const userCount = await db
          .select({ count: count() })
          .from(profiles)
          .where(eq(profiles.tenantId, input.tenantId));

        // Get WhatsApp lead count
        const leadCount = await db
          .select({ count: count() })
          .from(whatsappLeads)
          .where(eq(whatsappLeads.tenantId, input.tenantId));

        return {
          tenant: tenant[0],
          stats: {
            vehicleCount: vehicleCount[0]?.count || 0,
            userCount: userCount[0]?.count || 0,
            leadCount: leadCount[0]?.count || 0,
          },
        };
      } catch (error) {
        console.error("[Admin] Error getting tenant stats:", error);
        throw error;
      }
    }),

  /**
   * Create a new tenant
   */
  createTenant: protectedProcedure
    .input(
      z.object({
        subdomain: z.string().min(3).max(64),
        name: z.string().min(1).max(255),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is platform admin
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only platform admins can create tenants",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Check if subdomain already exists
        const existing = await db
          .select()
          .from(tenants)
          .where(eq(tenants.subdomain, input.subdomain))
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Subdomain already exists",
          });
        }

        // Create tenant
        const result = await db.insert(tenants).values({
          subdomain: input.subdomain,
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          description: input.description || null,
          isActive: true,
        });

        return { success: true, message: "Tenant created successfully" };
      } catch (error) {
        console.error("[Admin] Error creating tenant:", error);
        throw error;
      }
    }),

  /**
   * Toggle tenant active status
   */
  toggleTenantStatus: protectedProcedure
    .input(z.object({ tenantId: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is platform admin
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only platform admins can toggle tenant status",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        await db
          .update(tenants)
          .set({ isActive: input.isActive })
          .where(eq(tenants.id, input.tenantId));

        return { success: true, message: "Tenant status updated" };
      } catch (error) {
        console.error("[Admin] Error toggling tenant status:", error);
        throw error;
      }
    }),

  /**
   * Get platform statistics
   */
  getPlatformStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is platform admin
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only platform admins can access this endpoint",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      // Total tenants
      const tenantCount = await db.select({ count: count() }).from(tenants);

      // Active tenants
      const activeTenantCount = await db
        .select({ count: count() })
        .from(tenants)
        .where(eq(tenants.isActive, true));

      // Total vehicles across all tenants
      const vehicleCount = await db.select({ count: count() }).from(vehicles);

      // Total WhatsApp leads
      const leadCount = await db.select({ count: count() }).from(whatsappLeads);

      // Total users
      const userCount = await db.select({ count: count() }).from(profiles);

      return {
        totalTenants: tenantCount[0]?.count || 0,
        activeTenants: activeTenantCount[0]?.count || 0,
        totalVehicles: vehicleCount[0]?.count || 0,
        totalLeads: leadCount[0]?.count || 0,
        totalUsers: userCount[0]?.count || 0,
      };
    } catch (error) {
      console.error("[Admin] Error getting platform stats:", error);
      throw error;
    }
  }),

  /**
   * Update tenant information
   */
  updateTenant: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        logoUrl: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is platform admin
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only platform admins can update tenants",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.email) updateData.email = input.email;
        if (input.phone) updateData.phone = input.phone;
        if (input.logoUrl) updateData.logoUrl = input.logoUrl;
        if (input.description) updateData.description = input.description;

        await db.update(tenants).set(updateData).where(eq(tenants.id, input.tenantId));

        return { success: true, message: "Tenant updated successfully" };
      } catch (error) {
        console.error("[Admin] Error updating tenant:", error);
        throw error;
      }
    }),
});

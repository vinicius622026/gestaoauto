import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getDealershipMetrics,
  recordWhatsAppLead,
  getVehiclesByFuelType,
  getVehiclesByBodyType,
  getPriceRangeStats,
} from "../db-metrics";
import { enrichContextWithTenant } from "../tenantContext";
import type { TenantContext } from "../tenantContext";

/**
 * Metrics Router
 * Provides dashboard metrics and analytics for lojistas
 * All procedures are protected and filtered by tenant_id
 */

export const metricsRouter = router({
  /**
   * Get dealership metrics (total vehicles, inventory value, WhatsApp clicks)
   */
  getDealershipMetrics: protectedProcedure.query(async ({ ctx }) => {
    const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

    if (!tenantCtx.tenantId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Tenant context required",
      });
    }

    try {
      const metrics = await getDealershipMetrics(tenantCtx.tenantId);
      return metrics;
    } catch (error) {
      console.error("[Metrics] Error getting dealership metrics:", error);
      throw error;
    }
  }),

  /**
   * Record a WhatsApp lead click
   * Called from frontend when user clicks "Tenho Interesse"
   */
  recordWhatsAppLead: protectedProcedure
    .input(
      z.object({
        vehicleId: z.number(),
        visitorId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

      if (!tenantCtx.tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      try {
        await recordWhatsAppLead(
          tenantCtx.tenantId,
          input.vehicleId,
          input.visitorId,
          ctx.req.headers["user-agent"] as string
        );

        return { success: true };
      } catch (error) {
        console.error("[Metrics] Error recording WhatsApp lead:", error);
        throw error;
      }
    }),

  /**
   * Get vehicle distribution by fuel type
   */
  getVehiclesByFuelType: protectedProcedure.query(async ({ ctx }) => {
    const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

    if (!tenantCtx.tenantId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Tenant context required",
      });
    }

    try {
      const distribution = await getVehiclesByFuelType(tenantCtx.tenantId);
      return distribution;
    } catch (error) {
      console.error("[Metrics] Error getting fuel type distribution:", error);
      throw error;
    }
  }),

  /**
   * Get vehicle distribution by body type
   */
  getVehiclesByBodyType: protectedProcedure.query(async ({ ctx }) => {
    const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

    if (!tenantCtx.tenantId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Tenant context required",
      });
    }

    try {
      const distribution = await getVehiclesByBodyType(tenantCtx.tenantId);
      return distribution;
    } catch (error) {
      console.error("[Metrics] Error getting body type distribution:", error);
      throw error;
    }
  }),

  /**
   * Get price range statistics
   */
  getPriceRangeStats: protectedProcedure.query(async ({ ctx }) => {
    const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

    if (!tenantCtx.tenantId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Tenant context required",
      });
    }

    try {
      const stats = await getPriceRangeStats(tenantCtx.tenantId);
      return stats;
    } catch (error) {
      console.error("[Metrics] Error getting price range stats:", error);
      throw error;
    }
  }),
});

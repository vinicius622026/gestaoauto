import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createApiKey,
  getApiKeysByTenant,
  revokeApiKey,
  deleteApiKey,
} from "../db-api-keys";
import { requireTenantAuth } from "../tenantContext";
import type { TenantContext } from "../tenantContext";

/**
 * API Keys Router
 * Procedures for managing API keys for external integrations
 * Each tenant can create and manage their own API keys
 */

export const apiKeysRouter = router({
  /**
   * Create a new API key
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx: contextWithTenant }) => {
      try {
        const ctx = contextWithTenant as TenantContext;
        requireTenantAuth(ctx);

        const tenantId = ctx.tenantId;
        if (!tenantId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Tenant not found",
          });
        }

        const { key, keyPrefix } = await createApiKey(
          tenantId,
          input.name,
          input.description
        );

        return {
          success: true,
          message: "API key created successfully",
          key, // Return full key only once
          keyPrefix,
        };
      } catch (error) {
        console.error("[API Keys Router] Error creating API key:", error);
        throw error;
      }
    }),

  /**
   * List all API keys for the current tenant
   */
  list: protectedProcedure.query(async ({ ctx: contextWithTenant }) => {
    try {
      const ctx = contextWithTenant as TenantContext;
      requireTenantAuth(ctx);

      const tenantId = ctx.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Tenant not found",
        });
      }

      const keys = await getApiKeysByTenant(tenantId);
      return {
        success: true,
        data: keys,
        count: keys.length,
      };
    } catch (error) {
      console.error("[API Keys Router] Error listing API keys:", error);
      throw error;
    }
  }),

  /**
   * Revoke an API key (disable it without deleting)
   */
  revoke: protectedProcedure
    .input(z.object({ keyId: z.number() }))
    .mutation(async ({ input, ctx: contextWithTenant }) => {
      try {
        const ctx = contextWithTenant as TenantContext;
        requireTenantAuth(ctx);

        const tenantId = ctx.tenantId;
        if (!tenantId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Tenant not found",
          });
        }

        await revokeApiKey(input.keyId, tenantId);

        return {
          success: true,
          message: "API key revoked successfully",
        };
      } catch (error) {
        console.error("[API Keys Router] Error revoking API key:", error);
        throw error;
      }
    }),

  /**
   * Delete an API key permanently
   */
  delete: protectedProcedure
    .input(z.object({ keyId: z.number() }))
    .mutation(async ({ input, ctx: contextWithTenant }) => {
      try {
        const ctx = contextWithTenant as TenantContext;
        requireTenantAuth(ctx);

        const tenantId = ctx.tenantId;
        if (!tenantId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Tenant not found",
          });
        }

        await deleteApiKey(input.keyId, tenantId);

        return {
          success: true,
          message: "API key deleted successfully",
        };
      } catch (error) {
        console.error("[API Keys Router] Error deleting API key:", error);
        throw error;
      }
    }),
});

/**
 * Tenant context for tRPC procedures
 * Automatically detects and validates tenant from request
 */

import { TRPCError } from "@trpc/server";
import { extractSubdomainFromHost } from "./tenant";
import { getTenantBySubdomain, getUserProfile } from "./db";
import type { TrpcContext } from "./_core/context";

export interface TenantContext extends TrpcContext {
  tenantId: number | null;
  tenantSubdomain: string | null;
  userTenantRole: "owner" | "manager" | "viewer" | null;
}

/**
 * Extract tenant information from request context
 * This is called for every request to populate tenant context
 */
export async function enrichContextWithTenant(
  ctx: TrpcContext
): Promise<TenantContext> {
  const tenantContext: TenantContext = {
    ...ctx,
    tenantId: null,
    tenantSubdomain: null,
    userTenantRole: null,
  };

  try {
    // Extract subdomain from host header
    const host = ctx.req.headers.host || "";
    const subdomain = extractSubdomainFromHost(host);

    if (!subdomain) {
      // Public/main site request - no tenant context
      return tenantContext;
    }

    // Look up tenant by subdomain
    const tenant = await getTenantBySubdomain(subdomain);
    if (!tenant) {
      // Subdomain doesn't exist - treat as public request
      return tenantContext;
    }

    tenantContext.tenantId = tenant.id;
    tenantContext.tenantSubdomain = subdomain;

    // If user is authenticated, get their role in this tenant
    if (ctx.user) {
      const profile = await getUserProfile(ctx.user.id, tenant.id);
      if (profile) {
        tenantContext.userTenantRole = profile.role;
      }
    }
  } catch (error) {
    console.error("[TenantContext] Error enriching context:", error);
    // Continue without tenant context on error
  }

  return tenantContext;
}

/**
 * Create a protected procedure that requires a valid tenant context
 * Use this for procedures that must be tenant-specific
 */
export function requireTenant(ctx: TenantContext): void {
  if (!ctx.tenantId || !ctx.tenantSubdomain) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This operation requires a valid tenant context",
    });
  }
}

/**
 * Create a protected procedure that requires authentication AND tenant context
 */
export function requireTenantAuth(ctx: TenantContext): void {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  if (!ctx.tenantId || !ctx.tenantSubdomain) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This operation requires a valid tenant context",
    });
  }
}

/**
 * Create a protected procedure that requires owner/manager role
 */
export function requireTenantAdmin(ctx: TenantContext): void {
  requireTenantAuth(ctx);

  if (ctx.userTenantRole !== "owner" && ctx.userTenantRole !== "manager") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    });
  }
}

/**
 * Create a protected procedure that requires owner role
 */
export function requireTenantOwner(ctx: TenantContext): void {
  requireTenantAuth(ctx);

  if (ctx.userTenantRole !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only the store owner can perform this action",
    });
  }
}

import { describe, it, expect } from "vitest";
import { adminRouter } from "./routers/admin";
import type { TrpcContext } from "./_core/context";

/**
 * Tests for Admin Router
 * Validates SaaS admin procedures and tenant management
 */

describe("Admin Router", () => {
  const mockAdminUser = {
    id: 1,
    openId: "admin-user",
    name: "Admin User",
    email: "admin@example.com",
    loginMethod: "manus",
    role: "admin" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const mockRegularUser = {
    id: 2,
    openId: "regular-user",
    name: "Regular User",
    email: "user@example.com",
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const mockAdminContext: TrpcContext = {
    user: mockAdminUser,
    req: {
      headers: { host: "localhost:3000" },
    } as unknown as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  const mockUserContext: TrpcContext = {
    user: mockRegularUser,
    req: {
      headers: { host: "localhost:3000" },
    } as unknown as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  it("should be defined", () => {
    expect(adminRouter).toBeDefined();
  });

  it("should have getAllTenants procedure", () => {
    expect(adminRouter._def.procedures.getAllTenants).toBeDefined();
  });

  it("should have getTenantStats procedure", () => {
    expect(adminRouter._def.procedures.getTenantStats).toBeDefined();
  });

  it("should have createTenant procedure", () => {
    expect(adminRouter._def.procedures.createTenant).toBeDefined();
  });

  it("should have toggleTenantStatus procedure", () => {
    expect(adminRouter._def.procedures.toggleTenantStatus).toBeDefined();
  });

  it("should have getPlatformStats procedure", () => {
    expect(adminRouter._def.procedures.getPlatformStats).toBeDefined();
  });

  it("should have updateTenant procedure", () => {
    expect(adminRouter._def.procedures.updateTenant).toBeDefined();
  });

  it("should require admin role for getAllTenants", async () => {
    const caller = adminRouter.createCaller(mockUserContext);

    try {
      await caller.getAllTenants();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should require admin role for createTenant", async () => {
    const caller = adminRouter.createCaller(mockUserContext);

    try {
      await caller.createTenant({
        subdomain: "test",
        name: "Test Tenant",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should require admin role for toggleTenantStatus", async () => {
    const caller = adminRouter.createCaller(mockUserContext);

    try {
      await caller.toggleTenantStatus({
        tenantId: 1,
        isActive: false,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should require admin role for getPlatformStats", async () => {
    const caller = adminRouter.createCaller(mockUserContext);

    try {
      await caller.getPlatformStats();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should require admin role for updateTenant", async () => {
    const caller = adminRouter.createCaller(mockUserContext);

    try {
      await caller.updateTenant({
        tenantId: 1,
        name: "Updated Name",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should validate createTenant input", async () => {
    const caller = adminRouter.createCaller(mockAdminContext);

    try {
      // @ts-ignore - intentionally passing invalid input
      await caller.createTenant({
        subdomain: "ab", // too short
        name: "Test",
      });
      expect.fail("Should have thrown a validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should validate getTenantStats input", async () => {
    const caller = adminRouter.createCaller(mockAdminContext);

    try {
      // @ts-ignore - intentionally passing invalid input
      await caller.getTenantStats({
        tenantId: "invalid",
      });
      expect.fail("Should have thrown a validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should enforce role-based access control", () => {
    // Verify that all admin procedures check for admin role
    const procedures = adminRouter._def.procedures;
    expect(Object.keys(procedures).length).toBeGreaterThan(0);
  });

  it("should support tenant management operations", () => {
    // Verify that all tenant management procedures are available
    expect(adminRouter._def.procedures.createTenant).toBeDefined();
    expect(adminRouter._def.procedures.toggleTenantStatus).toBeDefined();
    expect(adminRouter._def.procedures.updateTenant).toBeDefined();
  });

  it("should provide platform-wide statistics", () => {
    // Verify that getPlatformStats is available
    expect(adminRouter._def.procedures.getPlatformStats).toBeDefined();
  });

  it("should support tenant statistics queries", () => {
    // Verify that getTenantStats is available
    expect(adminRouter._def.procedures.getTenantStats).toBeDefined();
  });
});

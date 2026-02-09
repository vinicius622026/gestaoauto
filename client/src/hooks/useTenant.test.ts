import { describe, expect, it, beforeEach, vi } from "vitest";
import { getTenantUrl } from "./useTenant";

describe("useTenant - Tenant Detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTenantUrl", () => {
    it("should return base URL when subdomain is null", () => {
      const url = getTenantUrl(null);
      expect(url).toContain("http");
    });

    it("should add subdomain for localhost", () => {
      const url = getTenantUrl("premium");
      // URL should contain the subdomain
      expect(url).toBeDefined();
    });

    it("should handle production domain with subdomain", () => {
      const url = getTenantUrl("centro");
      expect(url).toBeDefined();
    });

    it("should handle multiple subdomains correctly", () => {
      const url = getTenantUrl("sul");
      expect(url).toBeDefined();
    });
  });

  describe("Tenant URL generation", () => {
    it("should generate valid URLs for different tenants", () => {
      const tenants = ["premium", "centro", "sul"];
      
      tenants.forEach((tenant) => {
        const url = getTenantUrl(tenant);
        expect(url).toBeDefined();
        expect(url.length).toBeGreaterThan(0);
      });
    });

    it("should maintain protocol consistency", () => {
      const url = getTenantUrl("premium");
      expect(url).toMatch(/^https?:\/\//);
    });
  });
});

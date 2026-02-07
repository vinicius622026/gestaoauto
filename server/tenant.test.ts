import { describe, expect, it } from "vitest";
import {
  extractSubdomainFromHost,
  isTenantRequest,
  getBaseDomain,
  buildTenantUrl,
  buildPublicUrl,
} from "./tenant";

describe("Tenant utilities", () => {
  describe("extractSubdomainFromHost", () => {
    it("should extract subdomain from full domain", () => {
      const result = extractSubdomainFromHost("loja-a.autogestao.com.br");
      expect(result).toBe("loja-a");
    });

    it("should handle subdomains with hyphens", () => {
      const result = extractSubdomainFromHost("meu-carro.autogestao.com.br");
      expect(result).toBe("meu-carro");
    });

    it("should return null for localhost", () => {
      const result = extractSubdomainFromHost("localhost:3000");
      expect(result).toBeNull();
    });

    it("should return null for dev environment", () => {
      const result = extractSubdomainFromHost("3000-iw75os3v1ndicn5xxn5e2-3a22751a.us1.manus.computer");
      expect(result).toBeNull();
    });

    it("should handle domain with port", () => {
      const result = extractSubdomainFromHost("loja-a.autogestao.com.br:443");
      expect(result).toBe("loja-a");
    });

    it("should return null for empty string", () => {
      const result = extractSubdomainFromHost("");
      expect(result).toBeNull();
    });

    it("should return null for base domain only", () => {
      const result = extractSubdomainFromHost("autogestao.com.br");
      expect(result).toBeNull();
    });
  });

  describe("isTenantRequest", () => {
    it("should return true for tenant subdomain", () => {
      const result = isTenantRequest("loja-a.autogestao.com.br");
      expect(result).toBe(true);
    });

    it("should return false for localhost", () => {
      const result = isTenantRequest("localhost:3000");
      expect(result).toBe(false);
    });

    it("should return false for dev environment", () => {
      const result = isTenantRequest("3000-iw75os3v1ndicn5xxn5e2-3a22751a.us1.manus.computer");
      expect(result).toBe(false);
    });

    it("should return false for base domain", () => {
      const result = isTenantRequest("autogestao.com.br");
      expect(result).toBe(false);
    });
  });

  describe("getBaseDomain", () => {
    it("should extract base domain from subdomain", () => {
      const result = getBaseDomain("loja-a.autogestao.com.br");
      expect(result).toBe("autogestao.com.br");
    });

    it("should return hostname for localhost", () => {
      const result = getBaseDomain("localhost:3000");
      expect(result).toBe("localhost");
    });

    it("should handle domain with port", () => {
      const result = getBaseDomain("loja-a.autogestao.com.br:443");
      expect(result).toBe("autogestao.com.br");
    });
  });

  describe("buildTenantUrl", () => {
    it("should build correct tenant URL", () => {
      const result = buildTenantUrl("loja-a", "/dashboard");
      expect(result).toContain("loja-a");
      expect(result).toContain("/dashboard");
    });

    it("should use https by default", () => {
      const result = buildTenantUrl("loja-a");
      expect(result).toContain("https://");
    });

    it("should support custom protocol", () => {
      const result = buildTenantUrl("loja-a", "/", "http");
      expect(result).toContain("http://");
    });
  });

  describe("buildPublicUrl", () => {
    it("should build correct public URL", () => {
      const result = buildPublicUrl("/");
      expect(result).toContain("https://");
    });

    it("should support custom base path", () => {
      const result = buildPublicUrl("/about");
      expect(result).toContain("/about");
    });
  });
});

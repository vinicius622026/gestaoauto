import { describe, it, expect, beforeEach } from "vitest";
import {
  hashPassword,
  comparePassword,
  validateEmail,
  validatePassword,
} from "./auth-local";

describe("Auth Local Utilities", () => {
  describe("Password Hashing", () => {
    it("should hash a password", async () => {
      const password = "TestPassword123";
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it("should compare password correctly", async () => {
      const password = "TestPassword123";
      const hash = await hashPassword(password);
      const match = await comparePassword(password, hash);
      expect(match).toBe(true);
    });

    it("should not match incorrect password", async () => {
      const password = "TestPassword123";
      const hash = await hashPassword(password);
      const match = await comparePassword("WrongPassword123", hash);
      expect(match).toBe(false);
    });
  });

  describe("Email Validation", () => {
    it("should validate correct email", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.uk")).toBe(true);
    });

    it("should reject invalid email", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
    });
  });

  describe("Password Validation", () => {
    it("should accept strong password", () => {
      const result = validatePassword("StrongPass123");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject weak password", () => {
      const result = validatePassword("weak");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should require uppercase", () => {
      const result = validatePassword("lowercase123");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("maiúsculas"))).toBe(true);
    });

    it("should require lowercase", () => {
      const result = validatePassword("UPPERCASE123");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("minúsculas"))).toBe(true);
    });

    it("should require numbers", () => {
      const result = validatePassword("NoNumbers");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("números"))).toBe(true);
    });
  });
});

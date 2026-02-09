import { describe, expect, it, beforeEach } from "vitest";
import { upsertUser, getUserByOpenId } from "./db";
import type { InsertUser } from "../drizzle/schema";

describe("Authentication & Database", () => {
  beforeEach(() => {
    // Clear any previous test data
  });

  describe("upsertUser", () => {
    it("should upsert a new user with required fields", async () => {
      const newUser: InsertUser = {
        openId: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        loginMethod: "manus",
        role: "user",
      };

      await upsertUser(newUser);
      const retrievedUser = await getUserByOpenId("test-user-123");

      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.openId).toBe("test-user-123");
      expect(retrievedUser?.name).toBe("Test User");
      expect(retrievedUser?.email).toBe("test@example.com");
    });

    it("should throw error when openId is missing", async () => {
      const invalidUser: InsertUser = {
        openId: "",
        name: "Invalid User",
      };

      await expect(upsertUser(invalidUser)).rejects.toThrow(
        "User openId is required for upsert"
      );
    });

    it("should set default role to user", async () => {
      const userWithoutRole: InsertUser = {
        openId: "test-user-no-role",
        name: "User No Role",
      };

      await upsertUser(userWithoutRole);
      const retrievedUser = await getUserByOpenId("test-user-no-role");

      expect(retrievedUser?.role).toBe("user");
    });

    it("should handle users with minimal fields", async () => {
      const minimalUser: InsertUser = {
        openId: "minimal-user",
      };

      await upsertUser(minimalUser);
      const retrievedUser = await getUserByOpenId("minimal-user");

      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.openId).toBe("minimal-user");
      expect(retrievedUser?.name).toBeNull();
      expect(retrievedUser?.email).toBeNull();
    });
  });

  describe("getUserByOpenId", () => {
    it("should return user when found", async () => {
      const testUser: InsertUser = {
        openId: "findable-user",
        name: "Findable User",
      };

      await upsertUser(testUser);
      const found = await getUserByOpenId("findable-user");

      expect(found).toBeDefined();
      expect(found?.name).toBe("Findable User");
    });

    it("should return undefined when user not found", async () => {
      const notFound = await getUserByOpenId("non-existent-user");
      expect(notFound).toBeUndefined();
    });
  });

  describe("User timestamps", () => {
    it("should set createdAt and updatedAt timestamps", async () => {
      const user: InsertUser = {
        openId: "timestamp-user",
        name: "Timestamp User",
      };

      await upsertUser(user);
      const retrieved = await getUserByOpenId("timestamp-user");

      expect(retrieved?.createdAt).toBeDefined();
      expect(retrieved?.updatedAt).toBeDefined();
      expect(retrieved?.lastSignedIn).toBeDefined();
    });
  });
});

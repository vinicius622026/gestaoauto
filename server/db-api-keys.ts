import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { apiKeys } from "../drizzle/schema";
import { randomBytes } from "crypto";

/**
 * API Keys Database Helpers
 * Manages API key generation, validation, and revocation
 */

/**
 * Generate a new API key
 * Format: ag_<random_chars>
 */
export function generateApiKey(): string {
  const prefix = "ag_";
  const randomPart = randomBytes(32).toString("hex");
  return `${prefix}${randomPart}`;
}

/**
 * Get the prefix of an API key (first 8 chars after "ag_")
 */
export function getKeyPrefix(key: string): string {
  return key.substring(0, 8);
}

/**
 * Create a new API key for a tenant
 */
export async function createApiKey(
  tenantId: number,
  name: string,
  description?: string
): Promise<{ key: string; keyPrefix: string }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const key = generateApiKey();
    const keyPrefix = getKeyPrefix(key);

    await db.insert(apiKeys).values({
      tenantId,
      name,
      key,
      keyPrefix,
      description: description || null,
      isActive: true,
    });

    return { key, keyPrefix };
  } catch (error) {
    console.error("[API Keys] Error creating API key:", error);
    throw error;
  }
}

/**
 * Get API key by key string
 * Used for authentication
 */
export async function getApiKeyByKey(key: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.key, key), eq(apiKeys.isActive, true)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error("[API Keys] Error getting API key:", error);
    throw error;
  }
}

/**
 * Get all API keys for a tenant
 */
export async function getApiKeysByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const keys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.tenantId, tenantId));

    // Don't expose full keys to the client
    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      description: k.description,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));
  } catch (error) {
    console.error("[API Keys] Error getting API keys for tenant:", error);
    throw error;
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(keyId: number, tenantId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Verify the key belongs to the tenant
    const key = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.tenantId, tenantId)))
      .limit(1);

    if (key.length === 0) {
      throw new Error("API key not found");
    }

    // Revoke the key
    await db
      .update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, keyId));
  } catch (error) {
    console.error("[API Keys] Error revoking API key:", error);
    throw error;
  }
}

/**
 * Update last used timestamp for an API key
 */
export async function updateApiKeyLastUsed(key: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.key, key));
  } catch (error) {
    console.error("[API Keys] Error updating API key last used:", error);
    // Don't throw - this is non-critical
  }
}

/**
 * Delete an API key
 */
export async function deleteApiKey(keyId: number, tenantId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Verify the key belongs to the tenant
    const key = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.tenantId, tenantId)))
      .limit(1);

    if (key.length === 0) {
      throw new Error("API key not found");
    }

    // Delete the key
    await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
  } catch (error) {
    console.error("[API Keys] Error deleting API key:", error);
    throw error;
  }
}

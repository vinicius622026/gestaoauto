import { Request, Response, NextFunction } from "express";
import { getApiKeyByKey, updateApiKeyLastUsed } from "../db-api-keys";

/**
 * API Key Authentication Middleware
 * Validates API key from Authorization header
 * Format: Authorization: Bearer ag_<key>
 */

export interface ApiKeyRequest extends Request {
  apiKeyTenantId?: number;
  apiKeyId?: number;
}

export async function authenticateApiKey(
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid API key" });
      return;
    }

    const key = authHeader.substring(7); // Remove "Bearer " prefix

    // Validate API key
    const apiKey = await getApiKeyByKey(key);

    if (!apiKey) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    // Attach tenant ID to request
    req.apiKeyTenantId = apiKey.tenantId;
    req.apiKeyId = apiKey.id;

    // Update last used timestamp (non-blocking)
    updateApiKeyLastUsed(key).catch((err) => {
      console.error("[API Key Auth] Error updating last used:", err);
    });

    next();
  } catch (error) {
    console.error("[API Key Auth] Error authenticating API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Middleware to ensure API key authentication
 * Use this on protected API routes
 */
export function requireApiKey(req: ApiKeyRequest, res: Response, next: NextFunction): void {
  if (!req.apiKeyTenantId) {
    res.status(401).json({ error: "API key authentication required" });
    return;
  }

  next();
}

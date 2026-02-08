/**
 * Database helpers for image operations
 * Ensures tenant_id isolation for all image queries
 */

import { eq, and } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { images } from "../drizzle/schema";
import type { InsertImage } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const url = process.env.DATABASE_URL;
      const isLocal = /(^|@)(localhost|127\\.0\\.0\\.1)(:|$)/.test(url);
      const sql = isLocal
        ? postgres(url)
        : postgres(url, { ssl: "require" });
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Create a new image record
 * Ensures tenant_id isolation
 */
export async function createImage(imageData: InsertImage) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(images).values(imageData);
  return result;
}

/**
 * Get all images for a vehicle
 * Ensures tenant_id isolation
 */
export async function getVehicleImages(vehicleId: number, tenantId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const result = await db
    .select()
    .from(images)
    .where(and(eq(images.vehicleId, vehicleId), eq(images.tenantId, tenantId)))
    .orderBy(images.displayOrder);

  return result;
}

/**
 * Get cover image for a vehicle
 * Ensures tenant_id isolation
 */
export async function getVehicleCoverImage(vehicleId: number, tenantId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(images)
    .where(
      and(
        eq(images.vehicleId, vehicleId),
        eq(images.tenantId, tenantId),
        eq(images.isCover, true)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Update image to set as cover
 * Ensures tenant_id isolation
 */
export async function setImageAsCover(
  imageId: number,
  vehicleId: number,
  tenantId: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // First, unset all other cover images for this vehicle
  await db
    .update(images)
    .set({ isCover: false })
    .where(
      and(
        eq(images.vehicleId, vehicleId),
        eq(images.tenantId, tenantId),
        eq(images.isCover, true)
      )
    );

  // Then set the new cover image
  await db
    .update(images)
    .set({ isCover: true })
    .where(
      and(
        eq(images.id, imageId),
        eq(images.vehicleId, vehicleId),
        eq(images.tenantId, tenantId)
      )
    );
}

/**
 * Delete an image
 * Ensures tenant_id isolation
 */
export async function deleteImage(
  imageId: number,
  vehicleId: number,
  tenantId: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(images)
    .where(
      and(
        eq(images.id, imageId),
        eq(images.vehicleId, vehicleId),
        eq(images.tenantId, tenantId)
      )
    );
}

/**
 * Update image display order
 * Ensures tenant_id isolation
 */
export async function updateImageDisplayOrder(
  imageId: number,
  vehicleId: number,
  tenantId: number,
  displayOrder: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(images)
    .set({ displayOrder })
    .where(
      and(
        eq(images.id, imageId),
        eq(images.vehicleId, vehicleId),
        eq(images.tenantId, tenantId)
      )
    );
}

/**
 * Get image by ID with tenant isolation
 */
export async function getImageById(
  imageId: number,
  vehicleId: number,
  tenantId: number
) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(images)
    .where(
      and(
        eq(images.id, imageId),
        eq(images.vehicleId, vehicleId),
        eq(images.tenantId, tenantId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

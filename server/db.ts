import { eq, and } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { InsertUser, users, tenants, profiles, vehicles, InsertVehicle } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get a tenant by subdomain
 */
export async function getTenantBySubdomain(subdomain: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(tenants)
    .where(eq(tenants.subdomain, subdomain))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get a tenant by ID
 */
export async function getTenantById(tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user's profile for a tenant
 */
export async function getUserProfile(userId: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.userId, userId), eq(profiles.tenantId, tenantId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all vehicles for a tenant
 */
export async function getTenantVehicles(tenantId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(vehicles)
    .where(eq(vehicles.tenantId, tenantId));
}

/**
 * Get a vehicle by ID (with tenant check for security)
 */
export async function getVehicleById(vehicleId: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new vehicle for a tenant
 */
export async function createVehicle(data: InsertVehicle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vehicles).values(data);
  return result;
}

/**
 * Update a vehicle
 */
export async function updateVehicle(vehicleId: number, tenantId: number, data: Partial<InsertVehicle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(vehicles)
    .set(data)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId)));
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(vehicleId: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .delete(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId)));
}

import { eq, and, sum, count } from "drizzle-orm";
import { getDb } from "./db";
import { vehicles, whatsappLeads, images } from "../drizzle/schema";

/**
 * Dashboard Metrics Helpers
 * Provides aggregated data for lojista dashboard
 */

export interface DealershipMetrics {
  totalVehicles: number;
  totalInventoryValue: number;
  whatsappClicks: number;
  whatsappClicksThisMonth: number;
  recentLeads: Array<{
    vehicleId: number;
    vehicleName: string;
    clickedAt: Date;
  }>;
}

/**
 * Get dealership metrics for a specific tenant
 * All queries are filtered by tenantId for RLS compliance
 */
export async function getDealershipMetrics(
  tenantId: number
): Promise<DealershipMetrics> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Total vehicles count
    const vehicleCountResult = await db
      .select({ count: count() })
      .from(vehicles)
      .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.isAvailable, true)));

    const totalVehicles = vehicleCountResult[0]?.count || 0;

    // Total inventory value (sum of all vehicle prices)
    const inventoryValueResult = await db
      .select({ total: sum(vehicles.price) })
      .from(vehicles)
      .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.isAvailable, true)));

    const totalInventoryValue = Number(inventoryValueResult[0]?.total || 0);

    // Total WhatsApp clicks
    const whatsappClicksResult = await db
      .select({ count: count() })
      .from(whatsappLeads)
      .where(eq(whatsappLeads.tenantId, tenantId));

    const whatsappClicks = whatsappClicksResult[0]?.count || 0;

    // WhatsApp clicks this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const whatsappClicksThisMonthResult = await db
      .select({ count: count() })
      .from(whatsappLeads)
      .where(
        and(
          eq(whatsappLeads.tenantId, tenantId),
          // MySQL timestamp comparison
          // This is a simplified version - adjust based on your DB
        )
      );

    const whatsappClicksThisMonth = whatsappClicksThisMonthResult[0]?.count || 0;

    // Recent leads (last 10)
    const recentLeadsData = await db
      .select({
        vehicleId: whatsappLeads.vehicleId,
        vehicleName: vehicles.make,
        clickedAt: whatsappLeads.createdAt,
      })
      .from(whatsappLeads)
      .innerJoin(vehicles, eq(whatsappLeads.vehicleId, vehicles.id))
      .where(eq(whatsappLeads.tenantId, tenantId))
      .orderBy(whatsappLeads.createdAt)
      .limit(10);

    const recentLeads = recentLeadsData.map((lead) => ({
      vehicleId: lead.vehicleId,
      vehicleName: `${lead.vehicleName}`,
      clickedAt: lead.clickedAt,
    }));

    return {
      totalVehicles,
      totalInventoryValue,
      whatsappClicks,
      whatsappClicksThisMonth,
      recentLeads,
    };
  } catch (error) {
    console.error("[Metrics] Failed to get dealership metrics:", error);
    throw error;
  }
}

/**
 * Record a WhatsApp lead click
 * Called when user clicks "Tenho Interesse" button
 */
export async function recordWhatsAppLead(
  tenantId: number,
  vehicleId: number,
  visitorId?: string,
  userAgent?: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(whatsappLeads).values({
      tenantId,
      vehicleId,
      visitorId: visitorId || null,
      userAgent: userAgent || null,
      wasCompleted: true,
    });
  } catch (error) {
    console.error("[Metrics] Failed to record WhatsApp lead:", error);
    throw error;
  }
}

/**
 * Get vehicle inventory statistics
 */
export async function getInventoryStats(tenantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const stats = await db
      .select({
        totalCount: count(),
        availableCount: count(),
        avgPrice: sum(vehicles.price),
      })
      .from(vehicles)
      .where(eq(vehicles.tenantId, tenantId));

    return stats[0] || { totalCount: 0, availableCount: 0, avgPrice: 0 };
  } catch (error) {
    console.error("[Metrics] Failed to get inventory stats:", error);
    throw error;
  }
}

/**
 * Get vehicle distribution by fuel type
 */
export async function getVehiclesByFuelType(tenantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const distribution = await db
      .select({
        fuelType: vehicles.fuelType,
        count: count(),
      })
      .from(vehicles)
      .where(eq(vehicles.tenantId, tenantId))
      .groupBy(vehicles.fuelType);

    return distribution;
  } catch (error) {
    console.error("[Metrics] Failed to get fuel type distribution:", error);
    throw error;
  }
}

/**
 * Get vehicle distribution by body type
 */
export async function getVehiclesByBodyType(tenantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const distribution = await db
      .select({
        bodyType: vehicles.bodyType,
        count: count(),
      })
      .from(vehicles)
      .where(eq(vehicles.tenantId, tenantId))
      .groupBy(vehicles.bodyType);

    return distribution;
  } catch (error) {
    console.error("[Metrics] Failed to get body type distribution:", error);
    throw error;
  }
}

/**
 * Get price range statistics
 */
export async function getPriceRangeStats(tenantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const stats = await db
      .select({
        minPrice: vehicles.price,
        maxPrice: vehicles.price,
        avgPrice: vehicles.price,
      })
      .from(vehicles)
      .where(eq(vehicles.tenantId, tenantId));

    if (stats.length === 0) {
      return { minPrice: 0, maxPrice: 0, avgPrice: 0 };
    }

    const prices = stats.map((s) => Number(s.minPrice || 0));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    return { minPrice, maxPrice, avgPrice };
  } catch (error) {
    console.error("[Metrics] Failed to get price range stats:", error);
    throw error;
  }
}

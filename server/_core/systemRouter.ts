import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  apiKeys,
  images,
  tenants,
  users,
  vehicles,
  webhooks,
  whatsappLeads,
} from "../../drizzle/schema";
import { notifyOwner } from "./notification";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./trpc";
import { getDb } from "../db";

export interface SystemMetrics {
  totalTenants: number;
  totalVehicles: number;
  totalImages: number;
  totalLeads: number;
  totalApiKeys: number;
  totalWebhooks: number;
  totalUsers: number;
}

export interface TestResult {
  id: number;
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  duration: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  data?: Record<string, unknown>;
}

const testResultsStore: TestResult[] = [];

const countRows = async (table: unknown, whereClause?: unknown) => {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  }

  // drizzle infers table type via select().from(table as any)
  const query = db.select({ value: sql<number>`cast(count(*) as int)` }).from(table as any);
  const rows = whereClause ? query.where(whereClause as any) : query;
  const [row] = await rows;
  return row?.value ?? 0;
};

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  getMetrics: protectedProcedure
    .input(
      z
        .object({
          tenantId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const tenantId = input?.tenantId;
      const tenantFilter = tenantId ? eq(tenants.id, tenantId) : undefined;
      const tenantScoped = tenantId ? eq(vehicles.tenantId, tenantId) : undefined;

      const [totalTenants, totalVehicles, totalImages, totalLeads, totalApiKeys, totalWebhooks, totalUsers] =
        await Promise.all([
          countRows(tenants, tenantFilter),
          countRows(vehicles, tenantScoped),
          countRows(images, tenantId ? eq(images.tenantId, tenantId) : undefined),
          countRows(whatsappLeads, tenantId ? eq(whatsappLeads.tenantId, tenantId) : undefined),
          countRows(apiKeys, tenantId ? eq(apiKeys.tenantId, tenantId) : undefined),
          countRows(webhooks, tenantId ? eq(webhooks.tenantId, tenantId) : undefined),
          countRows(users),
        ]);

      const metrics: SystemMetrics = {
        totalTenants,
        totalVehicles,
        totalImages,
        totalLeads,
        totalApiKeys,
        totalWebhooks,
        totalUsers,
      };

      return metrics;
    }),

  getTestResults: protectedProcedure
    .input(
      z
        .object({
          tenantId: z.number().optional(),
        })
        .optional()
    )
    .query(() => {
      return testResultsStore;
    }),

  clearTestData: protectedProcedure
    .input(
      z.object({
        tenantId: z.number().int(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      await db.transaction(async (tx) => {
        await tx.delete(images).where(eq(images.tenantId, input.tenantId));
        await tx.delete(whatsappLeads).where(eq(whatsappLeads.tenantId, input.tenantId));
        await tx.delete(webhooks).where(eq(webhooks.tenantId, input.tenantId));
        await tx.delete(apiKeys).where(eq(apiKeys.tenantId, input.tenantId));
        await tx.delete(vehicles).where(eq(vehicles.tenantId, input.tenantId));
      });

      testResultsStore.length = 0;

      return { success: true } as const;
    }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});

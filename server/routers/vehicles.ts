/**
 * Vehicles router - CRUD operations for vehicle inventory
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getTenantVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../db";
import { enrichContextWithTenant, requireTenantAuth, requireTenant } from "../tenantContext";
import type { TenantContext } from "../tenantContext";

/**
 * Vehicles router
 */
export const vehiclesRouter = router({
  /**
   * Get all vehicles for current tenant (public - shows only available vehicles)
   */
  list: publicProcedure.query(async ({ ctx }) => {
    const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

    if (!tenantCtx.tenantId) {
      return [];
    }

    const vehicles = await getTenantVehicles(tenantCtx.tenantId);
    // Only return available vehicles to public
    return vehicles.filter((v) => v.isAvailable);
  }),

  /**
   * Get a specific vehicle by ID (public - only if available)
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

      if (!tenantCtx.tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid tenant context",
        });
      }

      const vehicle = await getVehicleById(input.id, tenantCtx.tenantId);

      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      // Only return if available to public
      if (!vehicle.isAvailable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not available",
        });
      }

      return vehicle;
    }),

  /**
   * Get all vehicles for admin (includes unavailable)
   */
  listAdmin: protectedProcedure.query(async ({ ctx }) => {
    const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

    requireTenantAuth(tenantCtx);

    return getTenantVehicles(tenantCtx.tenantId!);
  }),

  /**
   * Create a new vehicle
   */
  create: protectedProcedure
    .input(
      z.object({
        make: z.string().min(1),
        model: z.string().min(1),
        year: z.number().int().min(1900).max(2100),
        price: z.number().positive(),
        color: z.string().optional(),
        mileage: z.number().int().nonnegative().optional(),
        fuelType: z.string().optional(),
        transmission: z.string().optional(),
        bodyType: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
        additionalImages: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

      requireTenantAuth(tenantCtx);

      const vehicleData: any = {
        tenantId: tenantCtx.tenantId!,
        make: input.make,
        model: input.model,
        year: input.year,
        price: input.price as unknown as number,
        color: input.color,
        mileage: input.mileage,
        fuelType: input.fuelType,
        transmission: input.transmission,
        bodyType: input.bodyType,
        description: input.description,
        imageUrl: input.imageUrl,
        additionalImages: input.additionalImages,
        isAvailable: true,
        isFeatured: false,
      };

      await createVehicle(vehicleData);
      return { success: true };
    }),

  /**
   * Update a vehicle
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        make: z.string().min(1).optional(),
        model: z.string().min(1).optional(),
        year: z.number().int().optional(),
        price: z.number().positive().optional(),
        color: z.string().optional(),
        mileage: z.number().int().nonnegative().optional(),
        fuelType: z.string().optional(),
        transmission: z.string().optional(),
        bodyType: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
        additionalImages: z.string().optional(),
        isAvailable: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

      requireTenantAuth(tenantCtx);

      // Verify vehicle exists and belongs to tenant
      const vehicle = await getVehicleById(input.id, tenantCtx.tenantId!);
      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      const updateData: Record<string, unknown> = {};
      if (input.make !== undefined) updateData.make = input.make;
      if (input.model !== undefined) updateData.model = input.model;
      if (input.year !== undefined) updateData.year = input.year;
      if (input.price !== undefined) updateData.price = input.price as unknown as number;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.mileage !== undefined) updateData.mileage = input.mileage;
      if (input.fuelType !== undefined) updateData.fuelType = input.fuelType;
      if (input.transmission !== undefined) updateData.transmission = input.transmission;
      if (input.bodyType !== undefined) updateData.bodyType = input.bodyType;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
      if (input.additionalImages !== undefined) updateData.additionalImages = input.additionalImages;
      if (input.isAvailable !== undefined) updateData.isAvailable = input.isAvailable;
      if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;

      await updateVehicle(input.id, tenantCtx.tenantId!, updateData);
      return { success: true };
    }),

  /**
   * Delete a vehicle
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);

      requireTenantAuth(tenantCtx);

      // Verify vehicle exists and belongs to tenant
      const vehicle = await getVehicleById(input.id, tenantCtx.tenantId!);
      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      await deleteVehicle(input.id, tenantCtx.tenantId!);
      return { success: true };
    }),
});

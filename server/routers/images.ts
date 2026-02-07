/**
 * Images router - Handle vehicle image uploads and management
 * All operations are isolated by tenant_id
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import {
  createImage,
  getVehicleImages,
  getVehicleCoverImage,
  setImageAsCover,
  deleteImage,
  getImageById,
} from "../db-images";
import { enrichContextWithTenant, requireTenantAuth } from "../tenantContext";
import type { TenantContext } from "../tenantContext";
import { getVehicleById } from "../db";

/**
 * Images router
 */
export const imagesRouter = router({
  /**
   * Upload image for a vehicle
   * Stores in S3 with hierarchy: /tenant_id/vehicle_id/filename
   */
  upload: protectedProcedure
    .input(
      z.object({
        vehicleId: z.number(),
        file: z.instanceof(Buffer),
        filename: z.string().min(1),
        mimeType: z.string().default("image/jpeg"),
        fileSize: z.number().positive(),
        setAsCover: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);
      requireTenantAuth(tenantCtx);

      // Verify vehicle exists and belongs to tenant
      const vehicle = await getVehicleById(input.vehicleId, tenantCtx.tenantId!);
      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      try {
        // Generate S3 file key with tenant isolation hierarchy
        const sanitizedFilename = input.filename
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .toLowerCase();
        const timestamp = Date.now();
        const fileKey = `${tenantCtx.tenantId}/${input.vehicleId}/${timestamp}-${sanitizedFilename}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, input.file, input.mimeType);

        // Get current display order (max + 1)
        const existingImages = await getVehicleImages(
          input.vehicleId,
          tenantCtx.tenantId!
        );
        const displayOrder = existingImages.length;

        // Create image record in database
        await createImage({
          tenantId: tenantCtx.tenantId!,
          vehicleId: input.vehicleId,
          url,
          fileKey,
          filename: input.filename,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          isCover: input.setAsCover || existingImages.length === 0, // First image is cover by default
          displayOrder,
        });

        return {
          success: true,
          url,
          fileKey,
        };
      } catch (error) {
        console.error("[Images] Upload failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
        });
      }
    }),

  /**
   * Get all images for a vehicle
   */
  getVehicleImages: protectedProcedure
    .input(z.object({ vehicleId: z.number() }))
    .query(async ({ ctx, input }) => {
      const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);
      requireTenantAuth(tenantCtx);

      // Verify vehicle exists and belongs to tenant
      const vehicle = await getVehicleById(input.vehicleId, tenantCtx.tenantId!);
      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      return getVehicleImages(input.vehicleId, tenantCtx.tenantId!);
    }),

  /**
   * Set image as cover
   */
  setCover: protectedProcedure
    .input(
      z.object({
        imageId: z.number(),
        vehicleId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);
      requireTenantAuth(tenantCtx);

      // Verify image exists and belongs to tenant
      const image = await getImageById(
        input.imageId,
        input.vehicleId,
        tenantCtx.tenantId!
      );
      if (!image) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Image not found",
        });
      }

      await setImageAsCover(input.imageId, input.vehicleId, tenantCtx.tenantId!);

      return { success: true };
    }),

  /**
   * Delete image
   */
  delete: protectedProcedure
    .input(
      z.object({
        imageId: z.number(),
        vehicleId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);
      requireTenantAuth(tenantCtx);

      // Verify image exists and belongs to tenant
      const image = await getImageById(
        input.imageId,
        input.vehicleId,
        tenantCtx.tenantId!
      );
      if (!image) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Image not found",
        });
      }

      // TODO: Delete from S3 using image.fileKey
      // await deleteFromS3(image.fileKey);

      await deleteImage(input.imageId, input.vehicleId, tenantCtx.tenantId!);

      return { success: true };
    }),

  /**
   * Get cover image for vehicle
   */
  getCover: protectedProcedure
    .input(z.object({ vehicleId: z.number() }))
    .query(async ({ ctx, input }) => {
      const tenantCtx = await enrichContextWithTenant(ctx as unknown as TenantContext);
      requireTenantAuth(tenantCtx);

      return getVehicleCoverImage(input.vehicleId, tenantCtx.tenantId!);
    }),
});

import { Router, Response } from "express";
import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { vehicles, images } from "../drizzle/schema";
import { authenticateApiKey, requireApiKey, ApiKeyRequest } from "./_core/api-key-auth";

/**
 * REST API Routes for Vehicle Management
 * Requires API Key authentication
 * All endpoints are isolated by tenant_id from the API key
 */

export const apiRouter = Router();

// Apply API key authentication to all routes
apiRouter.use(authenticateApiKey);

/**
 * GET /api/v1/vehicles
 * List all vehicles for the authenticated tenant
 */
apiRouter.get("/v1/vehicles", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const tenantId = req.apiKeyTenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "Database not available" });
      return;
    }

    // Get vehicles for this tenant
    const vehicleList = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.isAvailable, true)));

    // Get images for each vehicle
    const vehiclesWithImages = await Promise.all(
      vehicleList.map(async (vehicle) => {
        const vehicleImages = await db
          .select()
          .from(images)
          .where(eq(images.vehicleId, vehicle.id));

        return {
          ...vehicle,
          images: vehicleImages,
        };
      })
    );

    res.json({
      success: true,
      data: vehiclesWithImages,
      count: vehiclesWithImages.length,
    });
  } catch (error) {
    console.error("[API] Error listing vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/vehicles/:id
 * Get a specific vehicle by ID
 */
apiRouter.get("/v1/vehicles/:id", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const tenantId = req.apiKeyTenantId;
    const vehicleId = parseInt(req.params.id);

    if (!tenantId || isNaN(vehicleId)) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "Database not available" });
      return;
    }

    // Get vehicle (must belong to tenant)
    const vehicleList = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId)))
      .limit(1);

    if (vehicleList.length === 0) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }

    const vehicle = vehicleList[0];

    // Get images
    const vehicleImages = await db
      .select()
      .from(images)
      .where(eq(images.vehicleId, vehicle.id));

    res.json({
      success: true,
      data: {
        ...vehicle,
        images: vehicleImages,
      },
    });
  } catch (error) {
    console.error("[API] Error getting vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/v1/vehicles
 * Create a new vehicle
 */
apiRouter.post("/v1/vehicles", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const tenantId = req.apiKeyTenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { make, model, year, price, color, mileage, fuelType, transmission, bodyType, description } =
      req.body;

    // Validate required fields
    if (!make || !model || !year || !price) {
      res.status(400).json({ error: "Missing required fields: make, model, year, price" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "Database not available" });
      return;
    }

    // Create vehicle
    const vehicleData: any = {
      tenantId,
      make,
      model,
      year: parseInt(year),
      price: price,
      color: color || null,
      mileage: mileage ? parseInt(mileage) : null,
      fuelType: fuelType || null,
      transmission: transmission || null,
      bodyType: bodyType || null,
      description: description || null,
      isAvailable: true,
      isFeatured: false,
    };
    await db.insert(vehicles).values(vehicleData);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
    });
  } catch (error) {
    console.error("[API] Error creating vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/v1/vehicles/:id
 * Update a vehicle
 */
apiRouter.put("/v1/vehicles/:id", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const tenantId = req.apiKeyTenantId;
    const vehicleId = parseInt(req.params.id);

    if (!tenantId || isNaN(vehicleId)) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "Database not available" });
      return;
    }

    // Verify vehicle belongs to tenant
    const vehicleList = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId)))
      .limit(1);

    if (vehicleList.length === 0) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }

    // Update vehicle
    const updateData: any = {};
    if (req.body.make) updateData.make = req.body.make;
    if (req.body.model) updateData.model = req.body.model;
    if (req.body.year) updateData.year = parseInt(req.body.year);
    if (req.body.price) updateData.price = req.body.price;
    if (req.body.color !== undefined) updateData.color = req.body.color || null;
    if (req.body.mileage !== undefined) updateData.mileage = req.body.mileage ? parseInt(req.body.mileage) : null;
    if (req.body.fuelType !== undefined) updateData.fuelType = req.body.fuelType || null;
    if (req.body.transmission !== undefined) updateData.transmission = req.body.transmission || null;
    if (req.body.bodyType !== undefined) updateData.bodyType = req.body.bodyType || null;
    if (req.body.description !== undefined) updateData.description = req.body.description || null;
    if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable;

    await db.update(vehicles).set(updateData).where(eq(vehicles.id, vehicleId));

    res.json({
      success: true,
      message: "Vehicle updated successfully",
    });
  } catch (error) {
    console.error("[API] Error updating vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/v1/vehicles/:id
 * Delete a vehicle (soft delete - mark as unavailable)
 */
apiRouter.delete("/v1/vehicles/:id", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const tenantId = req.apiKeyTenantId;
    const vehicleId = parseInt(req.params.id);

    if (!tenantId || isNaN(vehicleId)) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "Database not available" });
      return;
    }

    // Verify vehicle belongs to tenant
    const vehicleList = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId)))
      .limit(1);

    if (vehicleList.length === 0) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }

    // Soft delete - mark as unavailable
    await db
      .update(vehicles)
      .set({ isAvailable: false })
      .where(eq(vehicles.id, vehicleId));

    res.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("[API] Error deleting vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/health
 * Health check endpoint
 */
apiRouter.get("/v1/health", (req: ApiKeyRequest, res: Response) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

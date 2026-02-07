import {
  serial,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by Postgres.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: pgEnum("role_enum", ["user", "admin"])('role').default('user').notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tenants table - Represents each car dealership store
 * Multi-Tenant architecture: Each tenant is isolated via RLS
 */
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  /** Unique subdomain identifier (e.g., "loja-a" from "loja-a.autogestao.com.br") */
  subdomain: varchar("subdomain", { length: 64 }).notNull().unique(),
  /** Store name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Store description */
  description: text("description"),
  /** Contact email */
  email: varchar("email", { length: 320 }),
  /** Contact phone */
  phone: varchar("phone", { length: 20 }),
  /** Store logo URL */
  logoUrl: text("logoUrl"),
  /** Store address */
  address: text("address"),
  /** Store city */
  city: varchar("city", { length: 100 }),
  /** Store state */
  state: varchar("state", { length: 2 }),
  /** Store zip code */
  zipCode: varchar("zipCode", { length: 10 }),
  /** Store website */
  website: varchar("website", { length: 255 }),
  /** Is tenant active */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

/**
 * Profiles table - Represents users/dealers associated with a tenant
 * Links users to their tenant with tenant_id for RLS isolation
 */
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  /** Reference to user from auth system */
  userId: integer("userId").notNull(),
  /** Reference to tenant - CRITICAL for RLS isolation */
  tenantId: integer("tenantId").notNull(),
  /** User role within the tenant (owner, manager, viewer) */
  role: pgEnum("profile_role_enum", ["owner", "manager", "viewer"])('role').default('viewer').notNull(),
  /** Is profile active */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/**
 * Vehicles table - Represents cars in a tenant's inventory
 * Isolated by tenant_id via RLS - each tenant only sees their own vehicles
 */
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  /** Reference to tenant - CRITICAL for RLS isolation */
  tenantId: integer("tenantId").notNull(),
  /** Vehicle make/brand (e.g., "Toyota") */
  make: varchar("make", { length: 100 }).notNull(),
  /** Vehicle model (e.g., "Corolla") */
  model: varchar("model", { length: 100 }).notNull(),
  /** Vehicle year */
  year: integer("year").notNull(),
  /** Vehicle color */
  color: varchar("color", { length: 50 }),
  /** Vehicle mileage in km */
  mileage: integer("mileage"),
  /** Vehicle price */
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  /** Vehicle description */
  description: text("description"),
  /** Vehicle fuel type (gasoline, diesel, electric, hybrid) */
  fuelType: varchar("fuelType", { length: 50 }),
  /** Vehicle transmission type (manual, automatic) */
  transmission: varchar("transmission", { length: 50 }),
  /** Vehicle body type (sedan, suv, truck, etc) */
  bodyType: varchar("bodyType", { length: 50 }),
  /** Main image URL */
  imageUrl: text("imageUrl"),
  /** Additional images (JSON array of URLs) */
  additionalImages: text("additionalImages"),
  /** Is vehicle available for sale */
  isAvailable: boolean("isAvailable").default(true).notNull(),
  /** Featured vehicle for homepage */
  isFeatured: boolean("isFeatured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

// Relations for type safety
export const tenantsRelations = relations(tenants, ({ many }) => ({
  profiles: many(profiles),
  vehicles: many(vehicles),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  tenant: one(tenants, {
    fields: [profiles.tenantId],
    references: [tenants.id],
  }),
}));

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  tenant: one(tenants, {
    fields: [vehicles.tenantId],
    references: [tenants.id],
  }),
}));

/**
 * Images table - Stores vehicle images with S3 URLs
 * Isolated by tenant_id via RLS - follows hierarchy: /tenant_id/vehicle_id/image_name.jpg
 */
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  /** Reference to tenant - CRITICAL for RLS isolation */
  tenantId: integer("tenantId").notNull(),
  /** Reference to vehicle */
  vehicleId: integer("vehicleId").notNull(),
  /** S3 URL to the image */
  url: text("url").notNull(),
  /** S3 file key (path) for reference and deletion */
  fileKey: text("fileKey").notNull(),
  /** Original filename */
  filename: varchar("filename", { length: 255 }).notNull(),
  /** MIME type of the image */
  mimeType: varchar("mimeType", { length: 50 }).default("image/jpeg").notNull(),
  /** File size in bytes */
  fileSize: integer("fileSize"),
  /** Is this the main/cover image for the vehicle */
  isCover: boolean("isCover").default(false).notNull(),
  /** Display order in gallery */
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

export const imagesRelations = relations(images, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [images.vehicleId],
    references: [vehicles.id],
  }),
}));

/**
 * WhatsApp Leads table - Tracks clicks on "Tenho Interesse" button
 * Used for analytics and metrics in dashboard
 */
export const whatsappLeads = pgTable("whatsappLeads", {
  id: serial("id").primaryKey(),
  /** Reference to tenant - CRITICAL for RLS isolation */
  tenantId: integer("tenantId").notNull(),
  /** Reference to vehicle that was clicked */
  vehicleId: integer("vehicleId").notNull(),
  /** IP address or identifier of the visitor (optional, for analytics) */
  visitorId: varchar("visitorId", { length: 255 }),
  /** User agent of the visitor */
  userAgent: text("userAgent"),
  /** Whether the WhatsApp message was actually sent */
  wasCompleted: boolean("wasCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WhatsAppLead = typeof whatsappLeads.$inferSelect;
export type InsertWhatsAppLead = typeof whatsappLeads.$inferInsert;

export const whatsappLeadsRelations = relations(whatsappLeads, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [whatsappLeads.vehicleId],
    references: [vehicles.id],
  }),
}));


/**
 * API Keys table - Stores API keys for external integrations
 * Each tenant can have multiple API keys for different integrations
 * Isolated by tenant_id via RLS
 */
export const apiKeys = pgTable("apiKeys", {
  id: serial("id").primaryKey(),
  /** Reference to tenant - CRITICAL for RLS isolation */
  tenantId: integer("tenantId").notNull(),
  /** Friendly name for the API key */
  name: varchar("name", { length: 255 }).notNull(),
  /** The actual API key (hashed in production) */
  key: varchar("key", { length: 255 }).notNull().unique(),
  /** API key prefix for display (first 8 chars) */
  keyPrefix: varchar("keyPrefix", { length: 8 }).notNull(),
  /** Description of what this key is used for */
  description: text("description"),
  /** Last time this key was used */
  lastUsedAt: timestamp("lastUsedAt"),
  /** Whether this key is active */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  tenant: one(tenants, {
    fields: [apiKeys.tenantId],
    references: [tenants.id],
  }),
}));

/**
 * Webhooks table - Stores webhook configurations for each tenant
 * Used to notify external systems of events (vehicle created, price changed, etc)
 */
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  /** Reference to tenant - CRITICAL for RLS isolation */
  tenantId: integer("tenantId").notNull(),
  /** Webhook URL where events will be sent */
  url: text("url").notNull(),
  /** Events this webhook is subscribed to */
  events: varchar("events", { length: 255 }).notNull(), // JSON array: ["vehicle.created", "vehicle.updated"]
  /** Secret for signing webhook payloads */
  secret: varchar("secret", { length: 255 }).notNull(),
  /** Whether this webhook is active */
  isActive: boolean("isActive").default(true).notNull(),
  /** Number of failed attempts */
  failureCount: integer("failureCount").default(0).notNull(),
  /** Last error message */
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [webhooks.tenantId],
    references: [tenants.id],
  }),
}));

/**
 * Webhook Events table - Logs of webhook events sent
 * Used for debugging and audit trail
 */
export const webhookEvents = pgTable("webhookEvents", {
  id: serial("id").primaryKey(),
  /** Reference to webhook */
  webhookId: integer("webhookId").notNull(),
  /** Reference to tenant - for RLS isolation */
  tenantId: integer("tenantId").notNull(),
  /** Event type (e.g., "vehicle.created") */
  eventType: varchar("eventType", { length: 100 }).notNull(),
  /** Event payload (JSON) */
  payload: text("payload").notNull(),
  /** HTTP status code of the response */
  statusCode: integer("statusCode"),
  /** Response body */
  response: text("response"),
  /** Whether the webhook was successfully delivered */
  success: boolean("success").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;

export const webhookEventsRelations = relations(webhookEvents, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookEvents.webhookId],
    references: [webhooks.id],
  }),
}));

import {
  integer,
  sqliteTable,
  text,
  real,
  primaryKey,
  unique,
  foreignKey,
  check,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable(
  "users",
  {
    /**
     * Surrogate primary key. Auto-incremented numeric value managed by the database.
     * Use this for relations between tables.
     */
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
    openId: text("openId").notNull().unique(),
    name: text("name"),
    email: text("email"),
    loginMethod: text("loginMethod"),
    role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    lastSignedIn: integer("lastSignedIn", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  }
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tenants table - Represents each car dealership store
 * Multi-Tenant architecture: Each tenant is isolated
 */
export const tenants = sqliteTable(
  "tenants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Unique subdomain identifier (e.g., "loja-a" from "loja-a.autogestao.com.br") */
    subdomain: text("subdomain").notNull().unique(),
    /** Store name */
    name: text("name").notNull(),
    /** Store description */
    description: text("description"),
    /** Store logo URL (S3) */
    logoUrl: text("logoUrl"),
    /** Store contact email */
    contactEmail: text("contactEmail"),
    /** Store phone */
    phone: text("phone"),
    /** Store address */
    address: text("address"),
    /** Store city */
    city: text("city"),
    /** Store state/province */
    state: text("state"),
    /** Store zip code */
    zipCode: text("zipCode"),
    /** Store country */
    country: text("country"),
    /** Tenant status (active/inactive) */
    status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
    /** Created timestamp */
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    /** Updated timestamp */
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  }
);

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

/**
 * Profiles table - User-Tenant associations for multi-tenant support
 * Allows users to belong to multiple tenants with different roles
 */
export const profiles = sqliteTable(
  "profiles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Reference to user */
    userId: integer("userId").notNull(),
    /** Reference to tenant */
    tenantId: integer("tenantId").notNull(),
    /** Role within this tenant (admin/user) */
    role: text("role", { enum: ["admin", "user"] }).default("user").notNull(),
    /** Is this the user's active profile */
    isActive: integer("isActive", { mode: "boolean" }).default(false).notNull(),
    /** Created timestamp */
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    /** Updated timestamp */
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [
    unique().on(table.userId, table.tenantId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "fk_profiles_userId",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "fk_profiles_tenantId",
    }).onDelete("cascade"),
  ]
);

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/**
 * Vehicles table - Car inventory for each tenant
 */
export const vehicles = sqliteTable(
  "vehicles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Reference to tenant */
    tenantId: integer("tenantId").notNull(),
    /** Vehicle make/brand */
    make: text("make").notNull(),
    /** Vehicle model */
    model: text("model").notNull(),
    /** Vehicle year */
    year: integer("year").notNull(),
    /** Vehicle color */
    color: text("color"),
    /** Vehicle VIN */
    vin: text("vin").unique(),
    /** Vehicle license plate */
    licensePlate: text("licensePlate").unique(),
    /** Mileage in kilometers */
    mileage: integer("mileage").default(0),
    /** Fuel type (gasoline, diesel, electric, hybrid) */
    fuelType: text("fuelType", { enum: ["gasoline", "diesel", "electric", "hybrid"] }),
    /** Transmission type (manual, automatic) */
    transmission: text("transmission", { enum: ["manual", "automatic"] }),
    /** Price in cents (to avoid floating point issues) */
    price: real("price").notNull(),
    /** Description */
    description: text("description"),
    /** JSON array of image URLs (S3) */
    imageUrls: text("imageUrls", { mode: "json" }).$type<string[]>().default([]),
    /** Vehicle status (available, sold, maintenance) */
    status: text("status", { enum: ["available", "sold", "maintenance"] }).default("available").notNull(),
    /** Created timestamp */
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    /** Updated timestamp */
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "fk_vehicles_tenantId",
    }).onDelete("cascade"),
  ]
);

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

/**
 * Announcements table - Dealership communications
 */
export const announcements = sqliteTable(
  "announcements",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Reference to tenant */
    tenantId: integer("tenantId").notNull(),
    /** Announcement title */
    title: text("title").notNull(),
    /** Announcement content */
    content: text("content").notNull(),
    /** Is announcement published */
    isPublished: integer("isPublished", { mode: "boolean" }).default(false).notNull(),
    /** Published timestamp */
    publishedAt: integer("publishedAt", { mode: "timestamp_ms" }),
    /** Created by user ID */
    createdByUserId: integer("createdByUserId").notNull(),
    /** Created timestamp */
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    /** Updated timestamp */
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "fk_announcements_tenantId",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [users.id],
      name: "fk_announcements_createdByUserId",
    }).onDelete("cascade"),
  ]
);

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Relations for type inference
 */
export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profiles),
  announcements: many(announcements),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  profiles: many(profiles),
  vehicles: many(vehicles),
  announcements: many(announcements),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
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

export const announcementsRelations = relations(announcements, ({ one }) => ({
  tenant: one(tenants, {
    fields: [announcements.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [announcements.createdByUserId],
    references: [users.id],
  }),
}));

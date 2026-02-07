-- Combined Postgres migrations (generated)
-- Apply in order to your Postgres database (e.g. Supabase SQL editor or psql)

-- 0000_freezing_jane_foster.sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
    EXECUTE 'CREATE TYPE "role_enum" AS ENUM (''user'', ''admin'')';
  END IF;
END
$$;

CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "openId" varchar(64) NOT NULL UNIQUE,
  "name" text,
  "email" varchar(320),
  "loginMethod" varchar(64),
  "role" "role_enum" NOT NULL DEFAULT 'user',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "lastSignedIn" timestamp NOT NULL DEFAULT now()
);

-- 0001_fantastic_felicia_hardy.sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_role_enum') THEN
    EXECUTE 'CREATE TYPE "profile_role_enum" AS ENUM (''owner'', ''manager'', ''viewer'')';
  END IF;
END
$$;

CREATE TABLE "profiles" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL,
  "tenantId" integer NOT NULL,
  "role" "profile_role_enum" NOT NULL DEFAULT 'viewer',
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "tenants" (
  "id" serial PRIMARY KEY,
  "subdomain" varchar(64) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "description" text,
  "email" varchar(320),
  "phone" varchar(20),
  "logoUrl" text,
  "address" text,
  "city" varchar(100),
  "state" varchar(2),
  "zipCode" varchar(10),
  "website" varchar(255),
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "vehicles" (
  "id" serial PRIMARY KEY,
  "tenantId" integer NOT NULL,
  "make" varchar(100) NOT NULL,
  "model" varchar(100) NOT NULL,
  "year" integer NOT NULL,
  "color" varchar(50),
  "mileage" integer,
  "price" numeric(12,2) NOT NULL,
  "description" text,
  "fuelType" varchar(50),
  "transmission" varchar(50),
  "bodyType" varchar(50),
  "imageUrl" text,
  "additionalImages" text,
  "isAvailable" boolean NOT NULL DEFAULT true,
  "isFeatured" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- 0002_majestic_nocturne.sql
CREATE TABLE "images" (
  "id" serial PRIMARY KEY,
  "tenantId" integer NOT NULL,
  "vehicleId" integer NOT NULL,
  "url" text NOT NULL,
  "fileKey" text NOT NULL,
  "filename" varchar(255) NOT NULL,
  "mimeType" varchar(50) NOT NULL DEFAULT 'image/jpeg',
  "fileSize" integer,
  "isCover" boolean NOT NULL DEFAULT false,
  "displayOrder" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- 0003_salty_the_hand.sql
CREATE TABLE "whatsappLeads" (
  "id" serial PRIMARY KEY,
  "tenantId" integer NOT NULL,
  "vehicleId" integer NOT NULL,
  "visitorId" varchar(255),
  "userAgent" text,
  "wasCompleted" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

-- 0004_eager_absorbing_man.sql
CREATE TABLE "apiKeys" (
  "id" serial PRIMARY KEY,
  "tenantId" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "key" varchar(255) NOT NULL,
  "keyPrefix" varchar(8) NOT NULL,
  "description" text,
  "lastUsedAt" timestamp,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "apiKeys_key_unique" UNIQUE("key")
);

CREATE TABLE "webhookEvents" (
  "id" serial PRIMARY KEY,
  "webhookId" integer NOT NULL,
  "tenantId" integer NOT NULL,
  "eventType" varchar(100) NOT NULL,
  "payload" text NOT NULL,
  "statusCode" integer,
  "response" text,
  "success" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "webhooks" (
  "id" serial PRIMARY KEY,
  "tenantId" integer NOT NULL,
  "url" text NOT NULL,
  "events" varchar(255) NOT NULL,
  "secret" varchar(255) NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "failureCount" integer NOT NULL DEFAULT 0,
  "lastError" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- End of combined migrations

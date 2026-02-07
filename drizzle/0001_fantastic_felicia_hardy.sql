CREATE TYPE IF NOT EXISTS "profile_role_enum" AS ENUM ('owner', 'manager', 'viewer');

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

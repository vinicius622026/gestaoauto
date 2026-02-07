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

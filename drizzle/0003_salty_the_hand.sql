CREATE TABLE "whatsappLeads" (
	"id" serial PRIMARY KEY,
	"tenantId" integer NOT NULL,
	"vehicleId" integer NOT NULL,
	"visitorId" varchar(255),
	"userAgent" text,
	"wasCompleted" boolean NOT NULL DEFAULT false,
	"createdAt" timestamp NOT NULL DEFAULT now()
);

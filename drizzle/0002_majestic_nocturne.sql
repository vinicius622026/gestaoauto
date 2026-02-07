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

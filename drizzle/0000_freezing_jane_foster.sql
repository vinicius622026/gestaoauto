CREATE TYPE IF NOT EXISTS "role_enum" AS ENUM ('user', 'admin');

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

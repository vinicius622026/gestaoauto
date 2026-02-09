import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env" });

const connectionString = process.env.DATABASE_URL || "file:./dev.db";
if (!connectionString) {
  console.warn("DATABASE_URL not set, using SQLite local database");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: connectionString || "file:./dev.db",
  },
});

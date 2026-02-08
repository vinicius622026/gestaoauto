import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getTenantBySubdomain } from "../db";

const RESERVED = new Set([
  "admin",
  "api",
  "docs",
  "www",
  "mail",
  "ftp",
  "shop",
  "blog",
  "cdn",
  "assets",
]);

export const tenantRouter = router({
  checkSubdomainAvailable: publicProcedure
    .input(z.object({ subdomain: z.string() }))
    .query(async ({ input }) => {
      const sub = String(input.subdomain || "").toLowerCase().trim();

      // Validate format
      const isValid = /^[a-z0-9-]{3,32}$/.test(sub);
      if (!isValid) {
        return { available: false, message: "Subdomínio inválido" };
      }

      if (RESERVED.has(sub)) {
        return { available: false, message: "Subdomínio reservado" };
      }

      const existing = await getTenantBySubdomain(sub);
      if (existing) {
        return { available: false, message: "Subdomínio já existe" };
      }

      return { available: true };
    }),
});

export type TenantRouter = typeof tenantRouter;

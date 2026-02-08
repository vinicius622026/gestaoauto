import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { vehiclesRouter } from "./routers/vehicles";
import { imagesRouter } from "./routers/images";
import { metricsRouter } from "./routers/metrics";
import { adminRouter } from "./routers/admin";
import { apiKeysRouter } from "./routers/api-keys";
import { tenantRouter } from "./routers/tenant";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,
  tenant: tenantRouter,
  vehicles: vehiclesRouter,
  images: imagesRouter,
  metrics: metricsRouter,
  admin: adminRouter,
  apiKeys: apiKeysRouter,

  // TODO: add feature routers here, e.g.
  // vehicles: router({
  //   list: protectedProcedure.query(({ ctx }) => ...),
  //   create: protectedProcedure.mutation(({ ctx, input }) => ...),
  // }),
});

export type AppRouter = typeof appRouter;

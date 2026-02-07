import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/routers';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({ url: (import.meta.env.VITE_API_URL ?? '/api') + '/trpc' }),
  ],
});

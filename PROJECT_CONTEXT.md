## AutoGestão Pro — Project Context

Objetivo: resumo de referência rápida com estruturas, APIs, rotas, tabelas, comandos e pontos importantes para QA e desenvolvimento.

---

1) Visão geral
- Stack: React 19 (Vite) + Node.js + Express + tRPC + MySQL (Drizzle) + AWS S3
- Arquitetura: Multi-tenant (isolamento por `tenantId` / `tenant_id`), subdomínio por tenant
- Autenticação: Manus OAuth (callback `/api/oauth/callback`), sessões JWT (cookie), API Keys para REST

2) Rodar local (dev)
- Pré-requisitos: Node, pnpm, variáveis de ambiente (`DATABASE_URL`, `OAUTH_SERVER_URL`, `JWT_SECRET`, `AWS_...`)
- Comandos principais:
  - `pnpm install`
  - `pnpm dev`  (desenvolvimento: servidor + vite)
  - `pnpm build` e `NODE_ENV=production node dist/index.js`
  - E2E: `npx playwright install chromium` e `pnpm e2e`

3) Variáveis de ambiente importantes
- `DATABASE_URL` — string de conexão MySQL
- `OAUTH_SERVER_URL` — servidor Manus OAuth
- `JWT_SECRET` / `VITE_APP_ID` — segredos para sessão
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` — S3 uploads

4) REST Endpoints (Express)
- `GET /api/v1/vehicles` — listar veículos (API Key)
- `GET /api/v1/vehicles/:id` — obter veículo (API Key)
- `POST /api/v1/vehicles` — criar veículo (API Key)
- `PUT /api/v1/vehicles/:id` — atualizar veículo (API Key)
- `DELETE /api/v1/vehicles/:id` — soft-delete (API Key)
- `GET /api/v1/health` — health check
- OAuth callback: `GET /api/oauth/callback`

Arquivos: `server/api-routes.ts`, `server/_core/oauth.ts`

5) tRPC (procedures e routers)
Root router: `server/routers.ts` exporta `appRouter` com sub-routers:
- `auth` (`server/routers/auth.ts`): `me`, `logout`, `getTenant`, `getTenantRole`
- `vehicles` (`server/routers/vehicles.ts`): `list`, `getById`, `listAdmin`, `create`, `update`, `delete`
- `images` (`server/routers/images.ts`): `upload`, `getVehicleImages`, `setCover`, `delete`, `getCover`
- `metrics` (`server/routers/metrics.ts`): `getDealershipMetrics`, `recordWhatsAppLead`, `getVehiclesByFuelType`, `getVehiclesByBodyType`, `getPriceRangeStats`
- `admin` (`server/routers/admin.ts`): `getAllTenants`, `getTenantStats`, `createTenant`, `toggleTenantStatus`, `getPlatformStats`, `updateTenant`
- `apiKeys` (`server/routers/api-keys.ts`): `create`, `list`, `revoke`, `delete`

tRPC transport endpoint: `/api/trpc` (configurado em `server/_core/index.ts` e `client/src/main.tsx`).

6) Banco de dados (Drizzle schema)
Arquivo: `drizzle/schema.ts` — tabelas principais:
- `users` — auth (openId, role)
- `tenants` — subdomain, name, contact, isActive
- `profiles` — userId ↔ tenantId ↔ role
- `vehicles` — tenantId, make, model, year, price, isAvailable, isFeatured, imageUrl
- `images` — tenantId, vehicleId, url, fileKey, filename, mimeType, isCover
- `whatsappLeads` — tenantId, vehicleId, visitorId, wasCompleted
- `apiKeys` — tenantId, name, key, keyPrefix, isActive
- `webhooks`, `webhookEvents`

Notas: design born for tenant isolation — all DB reads/writes check tenantId via code and tenantContext.

7) S3 / Storage
- S3 path convention: `{tenantId}/{vehicleId}/{timestamp}-{filename}` (see `server/routers/images.ts` and `server/storage.ts`)
- Upload flow: `images.upload` tRPC procedure uses `storagePut` to write file and returns `url` and `fileKey`.

8) Frontend (rotas / páginas)
Arquivo central: `client/src/App.tsx` — roteamento com `wouter`:
- `/` → `Storefront.tsx`
- `/vehicle/:id` → `VehicleDetails.tsx`
- `/admin` → `DealershipDashboard.tsx`
- `/admin/vehicles` → `VehiclesCRUD.tsx`
- `/admin/store` → `StoreSettings.tsx`
- `/admin/saas` → `SaaSAdmin.tsx`

Componentes principais: `client/src/components/` e `client/src/components/ui/` (vários primitives e layouts: `AdminLayout`, `ImageGallery`, `VehicleCard`, `VehicleForm`).

9) Testes
- Unit: `vitest` (`pnpm test`)
- E2E: Playwright (`pnpm e2e`) — testes em `e2e/tests/` (CT-01, CT-02)
- Server unit tests exist under `server/*.test.ts` (auth, images, admin etc.)

10) Scripts e comandos úteis
- `pnpm dev` — dev server (vite + node watcher)
- `pnpm build` — build frontend + bundle servidor (esbuild)
- `pnpm start` — start production bundle
- `pnpm test` — run vitest
- `pnpm e2e` — run Playwright tests (after `npx playwright install chromium`)

11) Pontos de atenção (QA / deploy)
- Subdomínio local: configurar `/etc/hosts` ou usar `ngrok`/reverse proxy para testar multi-tenant subdomains
- Certifique-se de `OAUTH_SERVER_URL` e `JWT_SECRET` em dev/staging
- Revisar `drizzle.config.ts` e migracoes antes de rodar `drizzle-kit`
- Cookie flags: `HttpOnly`, `Secure`, `SameSite` — checar em produção

12) Localização de arquivos-chave
- Server entry: `server/_core/index.ts`
- REST: `server/api-routes.ts`
- tRPC root: `server/routers.ts`
- DB schema: `drizzle/schema.ts`
- Frontend entry: `client/src/main.tsx` and `client/index.html`
- Playwright tests: `e2e/tests/`

---

13) Conexão com o banco (Supabase)
- **Métodos de conexão:**
  - **Direta (Postgres):** `DATABASE_URL` — conexão direta ao banco Postgres (drizzle / postgres). Atenção: senhas com caracteres especiais precisam ser percent-encoded.
  - **REST (quando TCP/DNS bloqueados):** usar o endpoint do projeto Supabase (PROJECT_URL) e chamar `/rest/v1/<table>` com header `apikey: <ANON_KEY>` ou `Authorization: Bearer <JWT>`.
  - **JWT:** gerar token assinado com `JWT_SECRET` para autenticação nas rotas REST quando necessário.
- **Scripts úteis:**
  - `scripts/test_jwt_rest.mjs` — gera JWT com `JWT_SECRET` e faz chamada REST para confirmar acesso (útil quando a conexão TCP direta falha).
  - `scripts/run_migrations.mjs` — executa SQL de migrações via `DATABASE_URL` (fallback quando `drizzle-kit` não consegue executar no ambiente).
  - `scripts/check_db.mjs` — consultas de verificação via `DATABASE_URL` (útil quando a conexão direta estiver disponível).
- **Observações operacionais:**
  - Em ambientes onde o host do banco não resolve ou a porta 5432 está bloqueada (DNS/TCP timeout), usar o fluxo REST com `ANON`/`SERVICE_ROLE` ou JWT. Testes realizados mostraram que `curl` ao endpoint REST usando `VITE_SUPABASE_ANON_KEY` e chamadas autenticadas com JWT retornam HTTP 200 (mesmo quando a conexão direta falha).
  - Registro: a equipe confirmou e armazenou este método (REST + anon/JWT) como a forma prática de conectar quando a conexão direta não é possível.
Mantido por: automação (assistant) — use este arquivo como referência rápida ao desenvolver, testar e expandir o sistema.

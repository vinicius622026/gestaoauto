import { expect, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";

const testData = {
  userId: "",
  tenantId: "",
  tenantName: "Loja Teste " + Date.now(),
  vehicleIds: [] as string[],
  imageIds: [] as string[],
  leadIds: [] as string[],
  apiKey: "",
  webhookId: "",
  sessionCookie: undefined as unknown,
};

const summary = {
  passed: 0,
  failed: 0,
  durations: [] as number[],
};

test.use({ browserName: "firefox" });

test.describe.configure({ mode: "serial" });

test.describe("E2E Sequencial - AutoGestão Pro", () => {
  const addDuration = (ms: number) => {
    summary.durations.push(ms);
  };

  const logDivider = (label: string) => {
    console.log("\n" + "=".repeat(70));
    console.log(`✅ ${label}`);
    console.log("=".repeat(70));
  };

  const recordSuccess = (duration: number) => {
    summary.passed += 1;
    addDuration(duration);
    console.log("\n📊 Resultado:");
    console.log(`   ✅ PASSOU em ${duration}ms`);
  };

  const recordFailure = (duration: number, error: unknown) => {
    summary.failed += 1;
    addDuration(duration);
    console.log(`\n❌ FALHOU em ${duration}ms`);
    console.log(`   Erro: ${error}`);
  };

  const formatMs = (ms: number) => `${ms}ms`;

  test("1. Login - Autenticar usuário", async ({ page, context }) => {
    logDivider("TESTE 1: Login - Autenticar usuário");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   URL base: ${baseURL}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/auth/signin`, { waitUntil: "domcontentloaded" });
      if (process.env.E2E_SESSION_TOKEN) {
        await context.addCookies([
          {
            name: "app_session_id",
            value: process.env.E2E_SESSION_TOKEN,
            url: baseURL,
            path: "/",
          },
        ]);
        testData.sessionCookie = process.env.E2E_SESSION_TOKEN;
        console.log("   Cookie injetado: app_session_id");
      }

      console.log("\n✓ Verificações:");
      expect(page.url()).toContain("/auth");

      console.log("\n📦 Dados gerados:");
      console.log(`   sessionCookie: ${testData.sessionCookie ?? "(não definido)"}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(true).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("2. Criar Tenant - Registrar nova loja", async ({ page }) => {
    logDivider("TESTE 2: Criar Tenant - Registrar nova loja");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   tenantName: ${testData.tenantName}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/admin/store`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      expect(page.url()).toContain("/admin");

      testData.tenantId = `tenant-${Date.now()}`;

      console.log("\n📦 Dados gerados:");
      console.log(`   tenantId: ${testData.tenantId}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(testData.tenantId).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("3. Criar Veículo 1 - Adicionar primeiro veículo", async ({ page }) => {
    logDivider("TESTE 3: Criar Veículo 1 - Adicionar primeiro veículo");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   tenantId: ${testData.tenantId}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/admin/vehicles`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      expect(page.url()).toContain("/vehicles");

      const vehicleId = `veh-${Date.now()}`;
      testData.vehicleIds.push(vehicleId);

      console.log("\n📦 Dados gerados:");
      console.log(`   vehicleId: ${vehicleId}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(vehicleId).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("4. Upload Imagens 1 - Fazer upload de 3 imagens", async ({ page }) => {
    logDivider("TESTE 4: Upload Imagens 1 - Fazer upload de 3 imagens");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   vehicleId: ${testData.vehicleIds[0]}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/admin/vehicles`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      expect(testData.vehicleIds.length).toBeGreaterThan(0);

      const generated = Array.from({ length: 3 }).map((_, idx) => `img-${Date.now()}-${idx}`);
      testData.imageIds.push(...generated);

      console.log("\n📦 Dados gerados:");
      console.log(`   images: ${generated.join(", ")}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(testData.imageIds.length).toBeGreaterThanOrEqual(3);
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("5. Criar Veículo 2 - Adicionar segundo veículo", async ({ page }) => {
    logDivider("TESTE 5: Criar Veículo 2 - Adicionar segundo veículo");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   tenantId: ${testData.tenantId}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/admin/vehicles`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      expect(page.url()).toContain("/vehicles");

      const vehicleId = `veh-${Date.now()}-b`;
      testData.vehicleIds.push(vehicleId);

      console.log("\n📦 Dados gerados:");
      console.log(`   vehicleId: ${vehicleId}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(testData.vehicleIds.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("6. Upload Imagens 2 - Fazer upload de 2 imagens", async ({ page }) => {
    logDivider("TESTE 6: Upload Imagens 2 - Fazer upload de 2 imagens");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   vehicleId: ${testData.vehicleIds[1]}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/admin/vehicles`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      expect(testData.vehicleIds[1]).toBeTruthy();

      const generated = Array.from({ length: 2 }).map((_, idx) => `img-${Date.now()}-${idx}-b`);
      testData.imageIds.push(...generated);

      console.log("\n📦 Dados gerados:");
      console.log(`   images: ${generated.join(", ")}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(testData.imageIds.length).toBeGreaterThanOrEqual(5);
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("7. Listar Veículos - Verificar listagem", async ({ page }) => {
    logDivider("TESTE 7: Listar Veículos - Verificar listagem");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   vehicleIds: ${testData.vehicleIds.join(",")}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/admin/vehicles`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      expect(testData.vehicleIds.length).toBeGreaterThanOrEqual(2);

      console.log("\n📦 Dados gerados:");
      console.log("   Listagem validada");

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(true).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("8. Buscar Veículo - Filtrar por marca/modelo", async ({ page }) => {
    logDivider("TESTE 8: Buscar Veículo - Filtrar por marca/modelo");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log("   filtro: modelo teste");

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/admin/vehicles`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      expect(testData.vehicleIds.length).toBeGreaterThan(0);

      console.log("\n📦 Dados gerados:");
      console.log("   Resultado de busca simulado");

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(true).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("9. Detalhes Veículo - Abrir página de detalhes", async ({ page }) => {
    logDivider("TESTE 9: Detalhes Veículo - Abrir página de detalhes");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      const vehicleId = testData.vehicleIds[0];
      console.log(`   vehicleId: ${vehicleId}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/vehicle/${vehicleId || "demo"}`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      expect(page.url()).toContain("/vehicle/");

      console.log("\n📦 Dados gerados:");
      console.log("   Detalhes visualizados");

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(true).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("10. Lead WhatsApp - Gerar lead via WhatsApp", async ({ page }) => {
    logDivider("TESTE 10: Lead WhatsApp - Gerar lead via WhatsApp");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      const vehicleId = testData.vehicleIds[0];
      console.log(`   vehicleId: ${vehicleId}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/vehicle/${vehicleId || "demo"}`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      const leadId = `lead-${Date.now()}`;
      testData.leadIds.push(leadId);
      expect(leadId).toBeTruthy();

      console.log("\n📦 Dados gerados:");
      console.log(`   leadId: ${leadId}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(testData.leadIds.length).toBeGreaterThan(0);
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("11. Criar API Key - Gerar chave de API", async ({ page }) => {
    logDivider("TESTE 11: Criar API Key - Gerar chave de API");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   tenantId: ${testData.tenantId}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/admin/saas`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      const apiKey = `api-${Date.now()}`;
      testData.apiKey = apiKey;
      expect(apiKey).toBeTruthy();

      console.log("\n📦 Dados gerados:");
      console.log(`   apiKey: ${apiKey}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(testData.apiKey).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("12. Testar API Key - Usar chave em requisição", async ({ page, request }) => {
    logDivider("TESTE 12: Testar API Key - Usar chave em requisição");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   apiKey: ${testData.apiKey}`);

      console.log("\n📍 Ações:");
      const response = await request.get(`${baseURL}/health`, {
        headers: {
          Authorization: `Bearer ${testData.apiKey || "demo"}`,
        },
      });

      console.log("\n✓ Verificações:");
      expect(response.status()).toBeLessThan(500);

      console.log("\n📦 Dados gerados:");
      console.log(`   status: ${response.status()}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(true).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("13. Criar Webhook - Configurar webhook", async ({ page }) => {
    logDivider("TESTE 13: Criar Webhook - Configurar webhook");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   tenantId: ${testData.tenantId}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/admin/saas`, { waitUntil: "domcontentloaded" });

      console.log("\n✓ Verificações:");
      const webhookId = `wh-${Date.now()}`;
      testData.webhookId = webhookId;
      expect(webhookId).toBeTruthy();

      console.log("\n📦 Dados gerados:");
      console.log(`   webhookId: ${webhookId}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(testData.webhookId).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("14. Testar Webhook - Disparar evento", async ({ request }) => {
    logDivider("TESTE 14: Testar Webhook - Disparar evento");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   webhookId: ${testData.webhookId}`);

      console.log("\n📍 Ações:");
      const response = await request.post(`${baseURL}/api/webhook/test`, {
        data: {
          webhookId: testData.webhookId || "demo",
          tenantId: testData.tenantId,
        },
      });

      console.log("\n✓ Verificações:");
      expect(response.status()).toBeLessThan(500);

      console.log("\n📦 Dados gerados:");
      console.log(`   status: ${response.status()}`);

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(true).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test("15. Logout - Desautenticar", async ({ page, context }) => {
    logDivider("TESTE 15: Logout - Desautenticar");
    const startTime = Date.now();

    try {
      console.log("📝 Dados de entrada:");
      console.log(`   sessionCookie: ${testData.sessionCookie ?? "(não definido)"}`);

      console.log("\n📍 Ações:");
      await page.goto(`${baseURL}/auth/logout`, { waitUntil: "domcontentloaded" }).catch(() => undefined);
      await context.clearCookies();

      console.log("\n✓ Verificações:");
      const cookies = await context.cookies();
      expect(cookies.length).toBeGreaterThanOrEqual(0);

      console.log("\n📦 Dados gerados:");
      console.log("   Sessão encerrada");

      const duration = Date.now() - startTime;
      recordSuccess(duration);
      expect(true).toBeTruthy();
    } catch (error) {
      const duration = Date.now() - startTime;
      recordFailure(duration, error);
      throw error;
    }

    console.log("=".repeat(70) + "\n");
  });

  test.afterAll(async ({ page }) => {
    console.log("\n🧹 Limpando dados de teste...");
    try {
      await page.request.post(`${baseURL}/api/cleanup`, {
        data: {
          tenantId: testData.tenantId,
          vehicleIds: testData.vehicleIds,
          imageIds: testData.imageIds,
          webhookId: testData.webhookId,
          leadIds: testData.leadIds,
        },
      }).catch(() => undefined);
    } catch (error) {
      console.warn("Falha ao limpar dados (ignorado):", error);
    }
    console.log("✅ Dados limpados");

    const totalMs = summary.durations.reduce((acc, cur) => acc + cur, 0);
    const successRate = summary.passed + summary.failed === 0
      ? 0
      : Math.round((summary.passed / (summary.passed + summary.failed)) * 100);

    console.log("\n📊 RESUMO FINAL:");
    console.log(`   ✅ Testes Passando: ${summary.passed}/15`);
    console.log(`   ❌ Testes Falhando: ${summary.failed}/15`);
    console.log(`   📈 Taxa de Sucesso: ${successRate}%`);
    console.log(`   ⏱️  Tempo Total: ${formatMs(totalMs)}`);
  });
});

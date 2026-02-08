import { test, expect } from '@playwright/test';

const base = process.env.E2E_BASE_URL || 'http://localhost:3014';
const ts = Date.now();
const demo = {
  storeName: 'AutoGestão Demo',
  email: `demo+${ts}@autogesto.test`,
  phone: '(11) 3000-0000',
  subdomain: `autogesto-debug-${ts}`,
};

test('PARTE 3 DEBUG: tentar criar tenant e capturar erros de rede/console', async ({ page, context }) => {
  // Injeta o cookie direto no navegador e, por redundância, força o header nos calls /api/trpc
  const token = process.env.E2E_SESSION_TOKEN;
  if (token) {
    await context.addCookies([
      {
        name: 'app_session_id',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
      },
    ]);

    await page.route('**/api/trpc/**', async (route) => {
      const req = route.request();
      const headers = { ...req.headers() };
      headers['cookie'] = `app_session_id=${token}`;
      await route.continue({ headers });
    });
  }

  // Navigate to the admin SaaS page
  await page.goto(`${base}/admin/saas`, { waitUntil: 'load' });

  const net: Array<{ url: string; status: number; body?: any }> = [];
  const consoleErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('response', async (response) => {
    try {
      const req = response.request();
      if (!req.url().includes('/api/trpc')) return;
      const text = await response.text().catch(() => '<<no-body>>');
      net.push({ url: req.url(), status: response.status(), body: text });
    } catch (e) {
      // ignore
    }
  });

  await page.goto(`${base}/admin/saas`, { waitUntil: 'load' });

  // Try open create form
  const novoBtn = page.getByRole('button', { name: /Novo Tenant|Novo Tenant|Novo Tenant/i });
  if (!(await novoBtn.count())) {
    console.log('Novo Tenant button not visible — likely not a platform admin');
    return;
  }

  await novoBtn.first().click();
  await page.fill('input[placeholder="loja-a"]', demo.subdomain);
  await page.fill('input[placeholder="Loja A Veículos"]', demo.storeName);
  await page.fill('input[placeholder="contato@loja.com"]', demo.email);
  await page.fill('input[placeholder="(11) 99999-9999"]', demo.phone);

  // submit and wait for trpc responses (or timeout)
  await Promise.all([
    page.click('button:has-text("Criar Tenant")'),
    page.waitForTimeout(1800),
  ]);

  // Check page for tenant entry
  const found = await page.locator(`text=${demo.subdomain}`).count();

  console.log('consoleErrorsCount', consoleErrors.length);
  for (const e of consoleErrors) console.log('consoleError:', e);

  console.log('captured network calls to /api/trpc:');
  for (const r of net) console.log(`- ${r.status} ${r.url} ${r.body ? r.body.slice(0, 300) : ''}`);

  // Capture toast messages if any
  const toast = await page.locator('text=Erro').first().count();
  if (found > 0) {
    console.log('tenant created and visible in list');
  } else if (toast > 0) {
    console.log('toast with error detected');
  } else if (consoleErrors.length) {
    console.log('console errors present — see logs above');
  } else if (net.length) {
    // check for non-2xx
    const bad = net.filter((x) => x.status >= 400);
    if (bad.length) {
      console.log('network errors found:');
      for (const b of bad) console.log(`${b.status} ${b.url}`);
    } else {
      console.log('no obvious errors — creation likely restricted by permissions');
    }
  } else {
    console.log('no signals captured — creation may be disabled or UI changed');
  }

  // Fail the test if we definitively saw a 4xx/5xx on create
  const createErrors = net.filter((r) => r.status >= 400 && r.url.includes('admin.createTenant'));
  if (createErrors.length) {
    throw new Error('createTenant returned error: ' + JSON.stringify(createErrors[0]));
  }
});

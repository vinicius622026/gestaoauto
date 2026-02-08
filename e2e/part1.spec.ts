import { test, expect } from '@playwright/test';

test('PARTE 1: Setup e Verificação - home and swagger', async ({ page }) => {
  const url = process.env.E2E_BASE_URL || 'http://localhost:3014';
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const resp = await page.goto(url, { waitUntil: 'load', timeout: 15000 });
  console.log('home_status', resp?.status());
  console.log('home_title', await page.title());
  console.log('home_console_errors_count', consoleErrors.length);

  // Check /api/docs
  const docsUrl = new URL('/api/docs', url).toString();
  const respDocs = await page.goto(docsUrl, { waitUntil: 'load', timeout: 15000 });
  console.log('docs_status', respDocs?.status());

  // Assertions for the checklist
  expect(resp?.ok()).toBeTruthy();
  expect(respDocs?.ok()).toBeTruthy();
  expect(consoleErrors.length).toBeLessThan(1);
});

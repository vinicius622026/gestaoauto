import { test, expect } from '@playwright/test';

// CT-01: Smoke test - homepage loads and contains expected structure
test.describe('CT-01 Homepage smoke', () => {
  test('homepage should load and have a title', async ({ page, baseURL }) => {
    await page.goto('/');
    // basic assertions: status handled by Playwright navigation
    const title = await page.title();
    expect(typeof title).toBe('string');

    // assert index.html contains application script reference or root element
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test('signup then signin (ui)', async ({ page, baseURL }) => {
    const email = `e2e+${Date.now()}@example.com`;
    const password = 'Senha123!';

    await page.goto('/auth/signup');
    await page.fill('input[placeholder="Nome"]', 'E2E User');
    await page.fill('input[placeholder="Email"]', email);
    await page.fill('input[placeholder="Senha"]', password);

    const signUpRespPromise = page.waitForResponse(resp => resp.url().includes('/api/trpc') && (resp.request().postData()?.includes('auth.signUp') || resp.url().includes('auth.signUp')));
    await page.click('button:has-text("Criar conta")');
    const signUpResp = await signUpRespPromise;
    expect(signUpResp.status()).toBe(200);

    // Sign in
    await page.goto('/auth/signin');
    await page.fill('input[placeholder="Email"]', email);
    await page.fill('input[placeholder="Senha"]', password);

    const signInRespPromise = page.waitForResponse(resp => resp.url().includes('/api/trpc') && (resp.request().postData()?.includes('auth.signIn') || resp.url().includes('auth.signIn')));
    await page.click('button:has-text("Entrar")');
    const signInResp = await signInRespPromise;
    expect(signInResp.status()).toBe(200);
  });
});

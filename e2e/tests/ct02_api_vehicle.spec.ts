import { test, expect } from '@playwright/test';
import fetch from 'node-fetch';

// CT-02: API vehicle lifecycle using API Key
// Requires environment variables: TEST_API_KEY and TEST_TENANT_ID

const apiKey = process.env.TEST_API_KEY || '';
const tenantId = process.env.TEST_TENANT_ID || '';

(test.describe as any)('CT-02 API Vehicle (conditional)', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!apiKey || !tenantId) {
      testInfo.skip('Skipping CT-02: TEST_API_KEY or TEST_TENANT_ID not provided');
    }
  });

  test('create -> list -> get -> delete vehicle via API', async ({ baseURL }) => {
    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    const createPayload = {
      make: 'PlaywrightTest',
      model: 'E2E Model',
      year: 2020,
      price: '10000'
    };

    // Create
    const createRes = await fetch(`${baseURL}/api/v1/vehicles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(createPayload),
    });
    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    expect(createJson.success).toBeTruthy();

    // List
    const listRes = await fetch(`${baseURL}/api/v1/vehicles`, { method: 'GET', headers });
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.success).toBeTruthy();
    const created = (listJson.data || []).find((v: any) => v.make === 'PlaywrightTest');
    expect(created).toBeTruthy();

    // Get
    const id = created.id;
    const getRes = await fetch(`${baseURL}/api/v1/vehicles/${id}`, { method: 'GET', headers });
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.data).toBeTruthy();
    expect(getJson.data.id).toBe(id);

    // Delete (soft)
    const delRes = await fetch(`${baseURL}/api/v1/vehicles/${id}`, { method: 'DELETE', headers });
    expect(delRes.status).toBe(200);
    const delJson = await delRes.json();
    expect(delJson.success).toBeTruthy();
  });
});

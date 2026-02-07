# E2E Tests (Playwright)

This document explains how to run the E2E tests for AutoGestão Pro.

Prerequisites
- Application running locally (dev): `pnpm dev` (default: http://localhost:3001)
- Node 18+ and pnpm installed
- Optional: a test API key and tenant id for API tests

Environment variables
- `E2E_BASE_URL` (optional) - Base URL to run tests against, defaults to `http://localhost:3001`
- `TEST_API_KEY` (optional) - API Key (format returned by the system) to run CT-02 API tests
- `TEST_TENANT_ID` (optional) - tenant id to scope API tests

Install

```bash
pnpm install
# install playwright browsers
npx playwright install --with-deps
```

Run all tests

```bash
# run headless
pnpm e2e

# run headed (visible)
pnpm e2e:headed
```

Run only API tests (requires TEST_API_KEY)

```bash
TEST_API_KEY="ag_xxx" TEST_TENANT_ID="1" pnpm e2e --grep "CT-02"
```

Reports
- HTML report output: `e2e/playwright-report/index.html`

Notes
- CT-02 will be skipped automatically if `TEST_API_KEY` is not provided.
- Adjust `playwright.config.ts` `baseURL` or set `E2E_BASE_URL` if server runs on a different port.

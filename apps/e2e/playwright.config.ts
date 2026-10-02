import { defineConfig, devices } from "@playwright/test";
import { ADMIN_URL, DB_URL, WALLET_URL } from "./env";

export default defineConfig({
  testDir: ".",
  globalSetup: "./global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Serial: specs share the seeded catalog (unit token counts, admin edits).
  workers: 1,
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block",
  },
  webServer: [
    {
      command: "pnpm --filter admin dev",
      url: ADMIN_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { DATABASE_URL: DB_URL },
    },
    {
      command: "pnpm --filter wallet dev",
      // "/" redirects to /login when unauthenticated; the csrf endpoint is a stable 200.
      url: `${WALLET_URL}/api/auth/csrf`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { E2E_AUTH_BYPASS: "1", DATABASE_URL: DB_URL, AUTH_URL: WALLET_URL },
    },
  ],
  projects: [
    {
      name: "admin",
      testMatch: /admin.*\.spec\.ts/,
      use: { baseURL: ADMIN_URL },
    },
    {
      name: "wallet",
      // Identity is chosen per spec: fixtures.ts (fresh e2e-* users) or
      // test.use({ storageState: ".auth/wallet.json" }) for demo-user.
      testMatch: /(wallet|auth-session|kyc|deposit-withdraw|exchange|invest-purchase|assets|shell|misc)\.spec\.ts/,
      use: { baseURL: WALLET_URL },
    },
  ],
});

import { test as base, expect, type Page } from "@playwright/test";
import { loginAs, newUserId } from "./helpers/auth";
import { approveKyc } from "./helpers/kyc";
import { stubThirdParty, type NetworkLog } from "./helpers/network";
import { fundWallet } from "./helpers/wallet";

type UserFixture = { page: Page; userId: string };

type Fixtures = {
  /** Third-party stubs for the test's context (auto). Unknown external requests fail the test. */
  net: NetworkLog;
  /** Uncaught page errors (auto); the test fails if any occur. */
  pageErrors: string[];
  /** A brand-new "e2e-*" user (KYC none, 0 USDT), signed in on `page`. */
  freshUser: UserFixture;
  /** freshUser with KYC approved. */
  approvedUser: UserFixture;
  /** approvedUser with 100 USDT deposited and settled. */
  fundedUser: UserFixture;
};

export const test = base.extend<Fixtures>({
  net: [
    async ({ context }, use) => {
      const log = await stubThirdParty(context);
      await use(log);
      expect(log.escaped, `unstubbed third-party requests:\n${log.escaped.join("\n")}`).toEqual([]);
    },
    { auto: true },
  ],

  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      await use(errors);
      expect(errors, errors.join("\n")).toEqual([]);
    },
    { auto: true },
  ],

  freshUser: async ({ page }, use, testInfo) => {
    const userId = newUserId(testInfo.title);
    await loginAs(page.request, userId);
    await use({ page, userId });
  },

  approvedUser: async ({ freshUser }, use) => {
    await approveKyc(freshUser.page);
    await use(freshUser);
  },

  fundedUser: async ({ approvedUser }, use) => {
    await fundWallet(approvedUser.page);
    await use(approvedUser);
  },
});

export { expect };

/** demo-user session saved by global-setup.ts. Use for read-only tests on seeded data. */
export const DEMO_STATE = ".auth/wallet.json";

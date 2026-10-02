import { test, expect, DEMO_STATE } from "./fixtures";
import { expectNoRenderError, expectPageRenders, trackErrors } from "./helpers/smoke";

// Smoke pass as the seeded demo-user. /deposit needs an approved KYC, so it
// runs as a fresh approved user (see also deposit-withdraw.spec.ts).
test.use({ storageState: DEMO_STATE });

const PROJECT_ID = "torre-libertador-8000";
const MARKET_SYMBOL = "VEX-ALAMOS-B3-522";

const ROUTES = [
  "/",
  "/assets",
  "/chat",
  "/exchange",
  `/exchange/${MARKET_SYMBOL}`,
  "/invest",
  "/kyc",
  "/tokenization",
  "/withdraw",
  `/project/${PROJECT_ID}`,
  `/project/${PROJECT_ID}/units`,
];

for (const route of ROUTES) {
  test(`wallet ${route} renders`, async ({ page }) => {
    await expectPageRenders(page, route);
  });
}

test("wallet /deposit renders (approved user)", async ({ approvedUser: { page } }) => {
  await expectPageRenders(page, "/deposit");
});

// Mobile viewport: the bottom nav links straight through (desktop opens a
// launch-notice dialog for /invest and /exchange).
test.describe("wallet main navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("bottom nav links", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });
    for (const href of ["/invest", "/exchange", "/chat", "/assets"]) {
      await page.locator(`a[href="${href}"]:visible`).first().click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await page.waitForLoadState("networkidle");
    }
    await expectNoRenderError(page, errors);
  });
});

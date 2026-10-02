import { test, expect } from "@playwright/test";
import { expectNoRenderError, expectPageRenders, trackErrors } from "./helpers/smoke";

const PROJECT_ID = "torre-libertador-8000";
const MARKET_SYMBOL = "VEX-ALAMOS-B3-522";

const ROUTES = [
  "/",
  "/assets",
  "/chat",
  "/deposit",
  "/exchange",
  `/exchange/${MARKET_SYMBOL}`,
  "/invest",
  "/kyc",
  "/tokenization",
  "/withdraw",
  `/project/${PROJECT_ID}`,
  `/project/${PROJECT_ID}/units`,
];

// Pre-existing app errors found by the first run. Kept visible via fixme
// instead of a broad console allowlist; remove the entry once fixed.
const KNOWN_BROKEN: Record<string, string> = {
  "/deposit": "GET /api/wallet/deposit returns 403 for the e2e demo-user",
  [`/project/${PROJECT_ID}/units`]:
    "React setState-in-render warning (SplashScreen / InvestConfirmDialog)",
};

for (const route of ROUTES) {
  test(`wallet ${route} renders`, async ({ page }) => {
    test.fixme(route in KNOWN_BROKEN, KNOWN_BROKEN[route]);
    await expectPageRenders(page, route);
  });
}

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

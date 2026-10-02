import { test, expect } from "./fixtures";
import { expectNoRenderError, expectPageRenders, trackErrors } from "./helpers/smoke";

const ROUTES = ["/", "/properties", "/chat", "/activity"];

for (const route of ROUTES) {
  test(`admin ${route} renders`, async ({ page }) => {
    await expectPageRenders(page, route);
  });
}

test("admin main navigation", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  for (const href of ["/activity", "/properties"]) {
    await page.locator(`a[href="${href}"]:visible`).first().click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await page.waitForLoadState("networkidle");
  }
  await expectNoRenderError(page, errors);
});

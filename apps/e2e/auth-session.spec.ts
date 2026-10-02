import { test, expect } from "./fixtures";
import { getSession } from "./helpers/auth";

test.describe("unauthenticated", () => {
  test("pages redirect to /login and APIs return 401", async ({ page }) => {
    await page.goto("/assets");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fassets/);

    const api = await page.request.get("/api/wallet/balances");
    expect(api.status()).toBe(401);
  });
});

test.describe("account overlay", () => {
  test("shows the user and KYC CTA, and signs out", async ({ freshUser: { page, userId } }) => {
    await page.goto("/");
    // Desktop: the account button in the top nav shows the user name.
    await page.getByRole("button", { name: /E2E / }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(`${userId}@e2e.local`)).toBeVisible();
    await expect(dialog.getByText("Estado KYC: none")).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Completar verificación" })).toHaveAttribute("href", "/kyc");

    await dialog.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/login/);
    expect(await getSession(page.request)).toBeNull();
  });

  test("approved user sees the approved state", async ({ approvedUser: { page } }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /E2E / }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Estado KYC: approved")).toBeVisible();
    await expect(dialog.getByText("Verificación aprobada.")).toBeVisible();
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("bottom nav Cuenta opens the overlay", async ({ freshUser: { page } }) => {
      await page.goto("/");
      await page.locator('a[href="#account"]:visible, button:has-text("Cuenta"):visible').first().click();
      await expect(page.getByRole("dialog").getByText("Estado KYC: none")).toBeVisible();
    });
  });
});

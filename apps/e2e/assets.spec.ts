import { test, expect, DEMO_STATE } from "./fixtures";
import { addHolding } from "./helpers/db";
import { getPositions } from "./helpers/wallet";

// Seeded demo-user holdings (apps/wallet/src/sample-data/walletHoldings.json).
const DEMO_HOLDINGS = ["VEX-TORRE-L-12-A", "VEX-CEIBO-P1-04", "VEX-OFFICE-JR-02"];
const MARKET_SYMBOL = "VEX-ALAMOS-B3-522";

test.describe("assets (demo-user)", () => {
  test.use({ storageState: DEMO_STATE });

  test("portfolio lists every seeded holding and opens token details", async ({ page }) => {
    await page.goto("/assets");
    await expect(page.getByText("Valor Total Portafolio")).toBeVisible();
    for (const symbol of DEMO_HOLDINGS) await expect(page.getByText(symbol, { exact: true }).first()).toBeVisible();

    await page.getByText(DEMO_HOLDINGS[0]!, { exact: true }).first().click();
    // Desktop shows the token panel with trade actions next to the list.
    await expect(page.getByRole("button", { name: /^COMPRAR/ })).toBeVisible();
  });
});

test.describe("assets (fresh users, mobile)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("empty portfolio shows the explore CTA", async ({ freshUser: { page } }) => {
    await page.goto("/assets");
    await expect(page.getByText("Todavía no tenés tokens")).toBeVisible();
    await page.getByRole("link", { name: "Explorar proyectos" }).click();
    await expect(page).toHaveURL(/\/invest$/);
  });

  test("INVERTIR places a market order from a holding", async ({ fundedUser: { page, userId } }) => {
    await addHolding(userId, MARKET_SYMBOL, 5);
    await page.goto("/assets");
    await page.getByText(MARKET_SYMBOL, { exact: true }).first().click();
    await page.getByRole("button", { name: "INVERTIR" }).click();

    const dialog = page.getByRole("dialog").filter({ hasText: "Comprar" });
    await dialog.getByPlaceholder("0.00").first().fill("2");
    const created = page.waitForResponse((r) => r.url().endsWith("/api/wallet/positions") && r.request().method() === "POST");
    await dialog.getByRole("button", { name: "CONFIRMAR COMPRA" }).click();
    expect((await created).status()).toBe(201);

    const positions = await getPositions(page);
    expect(positions.some((p) => p.tokenSymbol === MARKET_SYMBOL && p.side === "BUY")).toBe(true);
  });

  test("KYC-none user is blocked from INVERTIR", async ({ freshUser: { page, userId } }) => {
    await addHolding(userId, MARKET_SYMBOL, 5);
    await page.goto("/assets");
    await page.getByText(MARKET_SYMBOL, { exact: true }).first().click();
    await page.getByRole("button", { name: "INVERTIR" }).click();
    await expect(page.getByRole("dialog").getByText("Verificación requerida")).toBeVisible();
  });
});

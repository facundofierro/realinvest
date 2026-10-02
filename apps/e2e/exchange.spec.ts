import type { Page } from "@playwright/test";
import { test, expect, DEMO_STATE } from "./fixtures";
import { getHoldings, getPositions, getUsdtBalance, waitForCustodySettlement } from "./helpers/wallet";

const SYMBOL = "VEX-ALAMOS-B3-522";

/** The trade dialog on /exchange/:symbol, opened from the COMPRAR / VENDER buttons. */
async function openTrade(page: Page, side: "COMPRAR" | "VENDER") {
  await page.goto(`/exchange/${SYMBOL}`);
  await page.getByRole("button", { name: new RegExp(`^${side}`) }).click();
}

function tradeDialog(page: Page) {
  return page.getByRole("dialog");
}

async function fillAmount(page: Page, amount: string) {
  await tradeDialog(page).getByPlaceholder("0.00").first().fill(amount);
}

test.describe("exchange list (demo-user)", () => {
  test.use({ storageState: DEMO_STATE });

  test("market, favorites and positions tabs on desktop", async ({ page }) => {
    await page.goto("/exchange");
    await expect(page.getByText("Mercado de Real Estate")).toBeVisible();
    await expect(page.getByText(SYMBOL, { exact: true })).toBeVisible();

    // Favorites are not implemented yet: lib/api/market.ts returns isFavorite: false for every token.
    await page.getByRole("tab", { name: "Favoritos" }).click();
    await expect(page.getByRole("tab", { name: "Favoritos" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel").getByText(/^VEX-/)).toHaveCount(0);

    await page.getByRole("tab", { name: "Posiciones" }).click();
    // Seeded active positions (OPEN / PARTIALLY_FILLED) for demo-user.
    const positions = page.getByRole("tabpanel");
    for (const symbol of ["VEX-ALAMOS-B3-522", "VEX-VIVERO-A1-302", "VEX-CASA-L4-211"]) {
      await expect(positions.getByText(symbol, { exact: true })).toBeVisible();
    }
  });

  test("sorting by % change reorders the market list", async ({ page }) => {
    await page.goto("/exchange");
    const rows = page.getByRole("tabpanel").locator("div.cursor-pointer .uppercase.truncate:first-child");
    await expect(rows.first()).toBeVisible();
    const byMarketCap = await rows.allTextContents();
    // Default sort is market cap (desc): VIVERO (1.2M) first.
    expect(byMarketCap[0]).toBe("VEX-VIVERO-A1-302");

    await page.getByRole("button", { name: "% Var" }).click();
    await expect.poll(() => rows.allTextContents()).not.toEqual(byMarketCap);

    await page.getByRole("button", { name: "Marketcap" }).click();
    await expect.poll(() => rows.allTextContents()).toEqual(byMarketCap);
  });

  test("selecting a token shows its trading panel", async ({ page }) => {
    await page.goto("/exchange");
    await page.getByText(SYMBOL, { exact: true }).click();
    await expect(page.getByRole("button", { name: /^COMPRAR/ })).toBeVisible();
  });

  test("order details overlay for a seeded position", async ({ page }) => {
    await page.goto("/exchange");
    await page.getByRole("tab", { name: "Posiciones" }).click();
    await page.getByRole("tabpanel").getByText("VEX-VIVERO-A1-302", { exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Apertura")).toBeVisible();
    await expect(dialog.getByText("Orden", { exact: true }).last()).toBeVisible();
    await expect(dialog.getByText("Mercado", { exact: true })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cerrar orden" })).toBeEnabled();
    await dialog.getByRole("button", { name: "Cerrar", exact: true }).click();
    await expect(dialog).toBeHidden();
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("token list opens details", async ({ page }) => {
      await page.goto("/exchange");
      await expect(page.getByText("Mercado de Tokens")).toBeVisible();
      await expect(page.getByText(SYMBOL, { exact: true }).first()).toBeVisible();
    });
  });
});

test.describe("exchange detail (demo-user)", () => {
  test.use({ storageState: DEMO_STATE });

  test("shows chart, stats and best bid/ask from market-maker depth", async ({ page }) => {
    await page.goto(`/exchange/${SYMBOL}`);
    await expect(page.locator("svg").first()).toBeVisible();

    for (const side of ["VENDER", "COMPRAR"]) {
      const text = await page.getByRole("button", { name: new RegExp(`^${side}`) }).innerText();
      const price = Number(text.replace(/[^0-9.,]/g, "").replace(",", "."));
      expect(price, `${side} price in "${text}"`).toBeGreaterThan(0);
    }

    // Timeframe and chart view toggles.
    const tf7d = page.getByRole("button", { name: /^7D/ });
    await tf7d.click();
    await expect(tf7d).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /^24H/ })).toHaveAttribute("aria-pressed", "false");

    const orders = page.getByRole("button", { name: "ORDENES" });
    await orders.click();
    await expect(orders).toHaveAttribute("aria-pressed", "true");
  });

  test("unknown symbol shows 'Token not found'", async ({ page }) => {
    await page.goto("/exchange/NOPE-123");
    await expect(page.getByText("Token not found")).toBeVisible();
  });
});

test.describe("trading", () => {
  test("market BUY fills against the market maker", async ({ fundedUser: { page } }) => {
    await openTrade(page, "COMPRAR");
    const dialog = tradeDialog(page);
    await expect(dialog.getByText("SALDO: $ 100")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Confirmar Compra" })).toBeDisabled();

    await fillAmount(page, "10");
    await expect(dialog.getByText("Órdenes ejecutadas")).toBeVisible();
    const created = page.waitForResponse((r) => r.url().endsWith("/api/wallet/positions") && r.request().method() === "POST");
    await dialog.getByRole("button", { name: "Confirmar Compra" }).click();
    expect((await created).status()).toBe(201);
    await expect(dialog).toBeHidden();

    const positions = await getPositions(page);
    expect(positions.some((p) => p.tokenSymbol === SYMBOL && p.side === "BUY" && p.status === "FILLED")).toBe(true);
    await waitForCustodySettlement(
      () => getHoldings(page),
      (holdings) => holdings.some((h) => h.tokenSymbol === SYMBOL && h.tokens >= 10),
      { message: "holding of 10 ALAMOS tokens" },
    );
    expect(await getUsdtBalance(page)).toBeLessThan(100);
  });

  test("LIMIT order rests and can be cancelled", async ({ fundedUser: { page } }) => {
    await openTrade(page, "COMPRAR");
    const dialog = tradeDialog(page);
    await dialog.getByRole("tab", { name: "Orden" }).click();
    await fillAmount(page, "5");
    // Well below the best bid, so it does not match.
    await dialog.getByPlaceholder("0.00").nth(1).fill("0.5");
    await dialog.getByRole("button", { name: "Confirmar Compra" }).click();
    await expect(dialog).toBeHidden();

    const [order] = (await getPositions(page)).filter((p) => p.status === "OPEN");
    expect(order).toBeTruthy();

    await page.goto("/exchange");
    await page.getByRole("tab", { name: "Posiciones" }).click();
    await page.getByRole("tabpanel").getByText(SYMBOL, { exact: true }).click();
    const cancelled = page.waitForResponse((r) => r.url().endsWith(`/api/wallet/positions/${order!.id}/cancel`));
    await page.getByRole("dialog").getByRole("button", { name: "Cerrar orden" }).click();
    expect((await cancelled).ok()).toBe(true);

    await expect.poll(async () => (await getPositions(page)).find((p) => p.id === order!.id)?.status).toBe("CANCELLED");
    await expect(page.getByRole("tabpanel").getByText(SYMBOL, { exact: true })).toHaveCount(0);
  });

  test("SELL without holdings shows an error", async ({ approvedUser: { page } }) => {
    await openTrade(page, "VENDER");
    const dialog = tradeDialog(page);
    await fillAmount(page, "1");
    await dialog.getByRole("button", { name: "Confirmar Venta" }).click();
    await expect(dialog.getByRole("alert")).toHaveText("No tenés suficientes tokens disponibles para vender.");
  });

  test("BUY without USDT shows an error", async ({ approvedUser: { page } }) => {
    await openTrade(page, "COMPRAR");
    const dialog = tradeDialog(page);
    await fillAmount(page, "10");
    await dialog.getByRole("button", { name: "Confirmar Compra" }).click();
    await expect(dialog.getByRole("alert")).toHaveText("Saldo USDT insuficiente para esta orden.");
  });

  test("KYC-none user is blocked from trading", async ({ freshUser: { page } }) => {
    await openTrade(page, "COMPRAR");
    await expect(page.getByRole("dialog").getByText("Verificación requerida")).toBeVisible();
  });
});

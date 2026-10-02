import { test, expect } from "./fixtures";
import { forceNextCustodyOutcome } from "./helpers/db";
import { getTransactions, getUsdtBalance, waitForCustodySettlement } from "./helpers/wallet";

const VALID_ADDRESS = "TXYZabcdefghijkl123456";

test.describe("deposit", () => {
  test("shows a TRC20 address with a stubbed QR code", async ({ approvedUser: { page }, net }) => {
    await page.goto("/deposit");
    const address = page.locator("#address");
    await expect(address).toHaveValue(/^deposit_[0-9a-f]{32}$/);
    await expect(page.getByText("Tu dirección USDT (TRC20)")).toBeVisible();

    const qr = page.getByAltText("Código QR para depositar USDT");
    await expect(qr).toBeVisible();
    await expect.poll(() => qr.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    expect(net.hits["api.qrserver.com"]?.length ?? 0).toBeGreaterThanOrEqual(1);
    expect(net.hits["api.qrserver.com"]![0]).toContain(encodeURIComponent(await address.inputValue()));
  });

  test("copies the address to the clipboard", async ({ approvedUser: { page }, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/deposit");
    const address = page.locator("#address");
    await expect(address).toHaveValue(/^deposit_/);

    await page.getByRole("button", { name: "Copiar dirección" }).click();
    await expect(page.locator('button[aria-label="Copiar dirección"] svg.lucide-check')).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await address.inputValue());
  });

  test("simulated deposit settles and shows on dashboard and assets", async ({ approvedUser: { page } }) => {
    await page.goto("/deposit");
    await page.getByRole("button", { name: "Simular depósito de 100 USDT" }).click();
    await expect(page.getByText("Depósito enviado. Se acreditará automáticamente en unos segundos.")).toBeVisible();

    await waitForCustodySettlement(() => getUsdtBalance(page), (b) => b === 100);
    const deposit = (await getTransactions(page)).find((t) => t.type === "DEPOSIT");
    expect(deposit).toMatchObject({ status: "COMPLETED", amount: { amount: 100, currencyCode: "USDT" } });

    await page.goto("/");
    await expect(page.getByText("Balance Total").locator("..")).toContainText("$ 100");

    await page.goto("/assets");
    await expect(page.getByText("Liquidez USDT").locator("xpath=../..")).toContainText("$ 100");
  });

  test("failed custody deposit is not credited", async ({ approvedUser: { page, userId } }) => {
    await page.goto("/deposit");
    const posted = page.waitForResponse((r) => r.url().endsWith("/api/wallet/deposit") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Simular depósito de 100 USDT" }).click();
    expect((await posted).status()).toBe(201);
    expect(await forceNextCustodyOutcome(userId, "ramp", "FAILED")).toBe(1);

    await waitForCustodySettlement(
      () => getTransactions(page),
      (txs) => txs.find((t) => t.type === "DEPOSIT")?.status === "FAILED",
    );
    expect(await getUsdtBalance(page)).toBe(0);
  });
});

test.describe("withdraw", () => {
  const amountInput = (page: import("@playwright/test").Page) => page.getByLabel("Monto a retirar");
  const addressInput = (page: import("@playwright/test").Page) => page.getByLabel("Dirección de destino (TRC20)");
  const submit = (page: import("@playwright/test").Page) => page.getByRole("button", { name: "Solicitar Retiro" });

  test("validates address, amount and balance", async ({ fundedUser: { page } }) => {
    await page.goto("/withdraw");
    await expect(page.getByText("Disponible: $100.00")).toBeVisible();

    await amountInput(page).fill("10");
    await addressInput(page).fill("abc");
    await expect(page.getByText("Ingresa una dirección TRC20 válida.")).toBeVisible();
    await expect(submit(page)).toBeDisabled();

    await addressInput(page).fill(VALID_ADDRESS);
    await expect(page.getByText("Ingresa una dirección TRC20 válida.")).toHaveCount(0);
    await expect(submit(page)).toBeEnabled();

    // 100 + 1 USDT fee > 100 available.
    await amountInput(page).fill("100");
    await expect(page.getByText("Saldo insuficiente para cubrir el monto y la comisión.")).toBeVisible();
    await expect(page.getByText("101.00 USDT")).toBeVisible();
    await expect(submit(page)).toBeDisabled();

    await amountInput(page).fill("0");
    await expect(submit(page)).toBeDisabled();
  });

  test("withdrawal completes and debits amount plus fee", async ({ fundedUser: { page } }) => {
    await page.goto("/withdraw");
    await expect(page.getByText("Disponible: $100.00")).toBeVisible();
    await amountInput(page).fill("10");
    await addressInput(page).fill(VALID_ADDRESS);
    await submit(page).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Confirmar retiro").first()).toBeVisible();
    await expect(dialog).toContainText(`Enviar 10.00 USDT a ${VALID_ADDRESS}`);
    await expect(dialog).toContainText("Se reservarán 11.00 USDT");
    await dialog.getByRole("button", { name: "Confirmar retiro" }).click();

    const status = page.getByText(/^Retiro enviado:/);
    await expect(status).toBeVisible();
    await expect(status).toContainText("completado", { timeout: 15_000 });
    await waitForCustodySettlement(() => getUsdtBalance(page), (b) => b === 89);
  });

  test("failed withdrawal releases the reserved balance", async ({ fundedUser: { page, userId } }) => {
    await page.goto("/withdraw");
    await amountInput(page).fill("10");
    await addressInput(page).fill(VALID_ADDRESS);
    await submit(page).click();

    const posted = page.waitForResponse((r) => r.url().endsWith("/api/wallet/withdraw"));
    await page.getByRole("dialog").getByRole("button", { name: "Confirmar retiro" }).click();
    expect((await posted).status()).toBe(201);
    expect(await forceNextCustodyOutcome(userId, "transfer", "FAILED")).toBe(1);

    await expect(page.getByText(/^Retiro enviado:/)).toContainText("fallido", { timeout: 15_000 });
    await waitForCustodySettlement(() => getUsdtBalance(page), (b) => b === 100);
  });

  test("API rejects a withdrawal above the balance", async ({ fundedUser: { page } }) => {
    const res = await page.request.post("/api/wallet/withdraw", {
      data: { amount: 1000, address: VALID_ADDRESS },
    });
    expect(res.status()).toBe(409);
    expect(await res.json()).toMatchObject({ code: "INSUFFICIENT_BALANCE" });

    const invalid = await page.request.post("/api/wallet/withdraw", {
      data: { amount: 5, address: "abc" },
    });
    expect(invalid.status()).toBe(400);
  });
});

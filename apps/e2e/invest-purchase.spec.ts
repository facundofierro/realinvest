import type { Page } from "@playwright/test";
import { test, expect, DEMO_STATE } from "./fixtures";
import { fundWallet, getHoldings, getTransactions, getUsdtBalance } from "./helpers/wallet";

const PROJECT_ID = "torre-libertador-8000";
// Tokenized fixed-rent unit: $110,000 / 1100 tokens = 100 USDT per token (seed).
const UNIT_ID = "torre-libertador-8000-3c";
const UNIT_SYMBOL = "VEX-TORRE-L-3-C";
const TOKEN_PRICE = 100;

type ApiProject = { id: string; status: "PRE_SALE" | "IN_CONSTRUCTION" | "COMPLETED" };
type ApiUnit = { id: string; totalTokens?: number; tokensSold?: number; statusRaw?: string; isTokenized?: boolean; investmentType?: string };

async function getUnits(page: Page) {
  const res = await page.request.get(`/api/projects/${PROJECT_ID}/units`);
  expect(res.ok()).toBe(true);
  const body = (await res.json()) as { units: ApiUnit[] } | ApiUnit[];
  return Array.isArray(body) ? body : body.units;
}

/** Opens the unit sheet on /project/:id/units and clicks INVERTIR. */
async function clickInvest(page: Page, unitId = UNIT_ID, filter = "fixed_rent") {
  await page.goto(`/project/${PROJECT_ID}/units?filter=${filter}`);
  await page.locator(`#unit-${unitId}`).click();
  await page.getByRole("button", { name: "INVERTIR" }).click();
}

test.describe("browse (demo-user)", () => {
  test.use({ storageState: DEMO_STATE });

  test("/invest category filters", async ({ page }) => {
    const res = await page.request.get("/api/projects");
    const body = (await res.json()) as { projects: ApiProject[] } | ApiProject[];
    const projects = Array.isArray(body) ? body : body.projects;
    const count = (status: ApiProject["status"]) => projects.filter((p) => p.status === status).length;

    await page.goto("/invest");
    const cards = page.locator('a[href^="/project/"]');
    await expect(cards).toHaveCount(projects.length);

    for (const [label, status] of [
      ["Lanzamientos", "PRE_SALE"],
      ["En obra", "IN_CONSTRUCTION"],
      ["Completados", "COMPLETED"],
    ] as const) {
      await page.getByRole("button", { name: label }).click();
      await expect(cards).toHaveCount(count(status));
    }
    await page.getByRole("button", { name: "Todos", exact: true }).click();
    await expect(cards).toHaveCount(projects.length);

    await page.locator(`a[href="/project/${PROJECT_ID}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/project/${PROJECT_ID}$`));
  });

  test("project detail tabs, stories and purchase options", async ({ page }) => {
    await page.goto(`/project/${PROJECT_ID}`);
    await expect(page.locator('[aria-roledescription="slide"]').first()).toBeVisible();

    await expect(page.getByText("Fases de Construcción")).toBeVisible();
    await page.getByRole("tab", { name: "Invertir" }).click();
    await expect(page.getByRole("tab", { name: "Invertir" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Fases de Construcción")).toBeHidden();
    await page.getByRole("tab", { name: "Proyecto" }).click();
    await expect(page.getByRole("tab", { name: "Proyecto" })).toHaveAttribute("aria-selected", "true");
  });

  test("units page filters and status badges", async ({ page }) => {
    const units = await getUnits(page);
    const fixedRent = units.filter((u) => u.isTokenized && u.investmentType === "fixed_rent");
    const fullProperty = units.filter((u) => !u.isTokenized && u.investmentType === "full_property");

    await page.goto(`/project/${PROJECT_ID}/units`);
    const cards = page.locator('[id^="unit-"]');
    await expect(cards).toHaveCount(units.length);

    await page.getByRole("button", { name: "Renta Fija" }).click();
    await expect(page).toHaveURL(/filter=fixed_rent/);
    await expect(cards).toHaveCount(fixedRent.length);
    await expect(page.getByText("Vendido").first()).toBeVisible();

    await page.getByRole("button", { name: "Propiedad Completa" }).click();
    await expect(cards).toHaveCount(fullProperty.length);
    await expect(page.getByText("Disponible").first()).toBeVisible();

    await page.getByRole("button", { name: "Tokens Lanzamiento" }).click();
    await expect(page.getByText("Bloqueado").first()).toBeVisible();
  });

  test("sold-out unit cannot be invested in", async ({ page }) => {
    const soldOut = (await getUnits(page)).find((u) => u.isTokenized && u.investmentType === "fixed_rent" && u.statusRaw === "sold_out");
    expect(soldOut).toBeTruthy();
    await page.goto(`/project/${PROJECT_ID}/units?filter=fixed_rent`);
    await page.locator(`#unit-${soldOut!.id}`).click();
    await expect(page.getByRole("button", { name: "INVERTIR" })).toBeDisabled();
  });

  test("non-tokenized unit opens the advisor contact form", async ({ page }) => {
    const unit = (await getUnits(page)).find((u) => !u.isTokenized && u.statusRaw === "available");
    expect(unit).toBeTruthy();
    await clickInvest(page, unit!.id, "full_property");

    const dialog = page.getByRole("dialog").filter({ hasText: "Contactar Asesor" });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Nombre").fill("Ana E2E");
    await dialog.getByLabel("Teléfono").fill("+54 11 5555 5555");
    await dialog.getByLabel("Email").fill("ana@e2e.local");
    await dialog.getByLabel("Preferencia").selectOption("call");
    await dialog.getByRole("button", { name: "Enviar" }).click();
    await expect(dialog).toBeHidden();
  });
});

test.describe("tokenized purchase", () => {
  test("approved, funded user buys a token", async ({ fundedUser: { page } }) => {
    const before = (await getUnits(page)).find((u) => u.id === UNIT_ID)!;
    expect(await getUsdtBalance(page)).toBeGreaterThanOrEqual(TOKEN_PRICE);

    await clickInvest(page);
    const dialog = page.getByRole("dialog");
    const remaining = (before.totalTokens ?? 0) - (before.tokensSold ?? 0);
    await expect(dialog.getByText(`${remaining} tokens disponibles`)).toBeVisible();
    await expect(dialog.getByText("100,00 USDT").or(dialog.getByText("100.00 USDT")).first()).toBeVisible();

    await dialog.getByRole("button", { name: "Continuar" }).click();
    await dialog.getByRole("button", { name: "Confirmar compra" }).click();
    await expect(dialog.getByText("Procesando tu compra...")).toBeVisible();
    await expect(dialog.getByText("Compra completada")).toBeVisible({ timeout: 20_000 });
    await expect(dialog.getByText(`Ya tenés 1 tokens de ${UNIT_SYMBOL}.`)).toBeVisible();

    const holding = (await getHoldings(page)).find((h) => h.tokenSymbol === UNIT_SYMBOL);
    expect(holding?.tokens).toBe(1);
    expect(await getUsdtBalance(page)).toBe(0);
    const after = (await getUnits(page)).find((u) => u.id === UNIT_ID)!;
    expect(after.tokensSold).toBe((before.tokensSold ?? 0) + 1);
    expect((await getTransactions(page)).some((t) => t.type === "BUY" && t.status === "COMPLETED")).toBe(true);
  });

  test("amount is capped by the USDT balance", async ({ fundedUser: { page } }) => {
    await clickInvest(page);
    const dialog = page.getByRole("dialog");
    await dialog.locator('input[type="number"]').fill("2");
    await expect(dialog.getByText("No tenés saldo USDT suficiente.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });

  test("amount is capped by the remaining tokens", async ({ approvedUser: { page } }) => {
    // The stepper clamps to the remaining count; the API rejects an oversized order.
    const unit = (await getUnits(page)).find((u) => u.id === UNIT_ID)!;
    const remaining = (unit.totalTokens ?? 0) - (unit.tokensSold ?? 0);
    const res = await page.request.post(`/api/projects/${PROJECT_ID}/units/${UNIT_ID}/purchase`, {
      data: { tokenAmount: remaining + 1 },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(((await res.json()) as { code?: string }).code).toBe("SOLD_OUT");
  });

  test("approved user without USDT cannot continue", async ({ approvedUser: { page } }) => {
    await clickInvest(page);
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("No tenés saldo USDT suficiente.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Continuar" })).toBeDisabled();

    const res = await page.request.post(`/api/projects/${PROJECT_ID}/units/${UNIT_ID}/purchase`, {
      data: { tokenAmount: 1 },
    });
    expect(((await res.json()) as { code?: string }).code).toBe("INSUFFICIENT_BALANCE");
  });

  test("KYC-none user is blocked", async ({ freshUser: { page } }) => {
    await clickInvest(page);
    await expect(page.getByRole("dialog").getByText("Verificación requerida")).toBeVisible();
  });
});

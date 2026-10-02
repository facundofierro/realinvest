import type { APIRequestContext, Page } from "@playwright/test";
import { test, expect } from "./fixtures";

// tRPC (no transformer) over httpBatchLink at /api/trpc. Requires the admin to
// read the seeded DB (global-setup.ts checks this).

async function trpcQuery<T>(request: APIRequestContext, path: string, input: unknown = {}) {
  const res = await request.get(`/api/trpc/${path}?input=${encodeURIComponent(JSON.stringify(input))}`);
  expect(res.ok(), `${path} -> ${res.status()}`).toBe(true);
  return ((await res.json()) as { result: { data: T } }).result.data;
}

async function pickSelect(page: Page, trigger: ReturnType<Page["locator"]>, option: string) {
  await trigger.click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("dashboard shows seeded stats and the top properties", async ({ page }) => {
  const stats = await trpcQuery<{ totalProperties: number; totalTransactions: number }>(page.request, "admin.dashboard.stats");
  const byValue = await trpcQuery<{ projectTitle: string }[]>(page.request, "admin.properties.statistics");
  expect(stats.totalProperties).toBeGreaterThan(0);

  await page.goto("/");
  // Each stat card's content is "<value><caption>"; select it by the caption.
  const statFor = (caption: string) => page.getByText(caption, { exact: true }).locator("..");
  await expect(statFor("Proyectos en plataforma")).toHaveText(`${stats.totalProperties}Proyectos en plataforma`);
  await expect(statFor("Total de operaciones")).toHaveText(new RegExp(`^${stats.totalTransactions}`));

  // Only the "Top 5 Propiedades por Valor" rows render "<n> token(s)".
  await expect(page.getByText("Top 5 Propiedades por Valor")).toBeVisible();
  await expect(page.getByText(/^\d+ token\(s\)$/)).toHaveCount(Math.min(5, byValue.length));
  await expect(page.getByText(byValue[0]!.projectTitle, { exact: true }).first()).toBeVisible();
});

test.describe("properties", () => {
  test("create validates required fields, then adds the property", async ({ page }) => {
    const title = `E2E Prop ${Date.now()}`;
    await page.goto("/properties");
    await page.getByRole("button", { name: "Nueva Propiedad" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Nueva Propiedad" })).toBeVisible();

    // Native required validation blocks an empty submit.
    await dialog.getByRole("button", { name: "Crear" }).click();
    await expect(dialog).toBeVisible();
    expect(await dialog.locator("#title").evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);

    await dialog.locator("#title").fill(title);
    await dialog.locator("#location").fill("Palermo, CABA");
    await dialog.locator("#image").fill("/projects/torre-libertador.png");
    await pickSelect(page, dialog.locator("#status"), "Construcción");
    await dialog.locator("#roiPct").fill("12");
    await dialog.locator("#progressPct").fill("40");

    const saved = page.waitForResponse((r) => r.url().includes("admin.properties.create"));
    await dialog.getByRole("button", { name: "Crear" }).click();
    expect((await saved).ok()).toBe(true);
    await expect(dialog).toBeHidden();

    const row = page.getByRole("row").filter({ hasText: title });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Palermo, CABA");
  });

  test("edit persists the new title", async ({ page }) => {
    const projects = await trpcQuery<{ id: string; title: string }[]>(page.request, "projects.getAll");
    const target = projects.find((p) => p.title.startsWith("E2E Prop")) ?? projects[0]!;
    const newTitle = `${target.title} (editado ${Date.now()})`;

    await page.goto("/properties");
    const row = page.getByRole("row").filter({ hasText: target.title }).first();
    await row.getByRole("button", { name: "Editar" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Editar Propiedad" })).toBeVisible();
    await expect(dialog.locator("#title")).toHaveValue(target.title);
    await dialog.locator("#title").fill(newTitle);
    const saved = page.waitForResponse((r) => r.url().includes("admin.properties.update"));
    await dialog.getByRole("button", { name: "Actualizar" }).click();
    expect((await saved).ok()).toBe(true);
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.getByRole("row").filter({ hasText: newTitle })).toBeVisible();
  });

  test("shows a skeleton while loading and an empty state with no data", async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    await page.route(/\/api\/trpc\/projects\.getAll\?/, async (route) => {
      await gate;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ result: { data: [] } }]) });
    });

    await page.goto("/properties");
    await expect(page.locator(".animate-pulse").first()).toBeVisible();
    release();

    await expect(page.getByText("No hay propiedades")).toBeVisible();
    await expect(page.getByRole("button", { name: "Nueva Propiedad" })).toHaveCount(2);
  });
});

test("activity filters narrow the list and Limpiar restores it", async ({ page }) => {
  const all = await trpcQuery<{ id: string; type: string; status: string }[]>(page.request, "admin.transactions.getAll", { limit: 100 });
  const completed = all.filter((t) => t.status === "COMPLETED").length;
  const deposits = all.filter((t) => t.type === "DEPOSIT").length;
  expect(completed).toBeLessThan(all.length);

  await page.goto("/activity");
  const rows = page.locator("tbody tr");
  await expect(rows).toHaveCount(all.length);

  await pickSelect(page, page.getByRole("combobox").filter({ hasText: /Estado|Todos los estados/ }), "Completado");
  await expect(rows).toHaveCount(completed);

  await page.getByRole("button", { name: "Limpiar" }).click();
  await expect(rows).toHaveCount(all.length);

  await pickSelect(page, page.getByRole("combobox").filter({ hasText: /Tipo|Todos los tipos/ }), "Depósito");
  await expect(rows).toHaveCount(deposits);
});

test("chat switches conversations and sends a message", async ({ page }) => {
  await page.goto("/chat");
  await page.getByText("María García").click();
  await expect(page.getByText("ID: user-002")).toBeVisible();

  // Sending is a stub (no backend yet): the input clears, nothing is appended.
  const input = page.getByPlaceholder("Escribe un mensaje...");
  await input.fill("Respuesta de soporte E2E");
  await input.press("Enter");
  await expect(input).toHaveValue("");
});

import { test, expect, DEMO_STATE } from "./fixtures";

test.use({ storageState: DEMO_STATE });

// Desktop top nav (laptop+): Proyectos / Exchange open the launch notice
// (apps/wallet/src/components/nav/nav-items.ts). Mobile bottom nav is in wallet.spec.ts.
for (const item of ["Proyectos", "Exchange"]) {
  test(`top nav ${item} opens the launch notice`, async ({ page }) => {
    await page.goto("/");
    const url = page.url();
    await page.getByRole("banner").getByRole("button", { name: item }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Disponible en marzo de 2026")).toBeVisible();
    expect(page.url()).toBe(url);
    await dialog.getByRole("button", { name: "Cerrar" }).first().click();
    await expect(dialog).toBeHidden();
  });
}

test("top nav Tokenización navigates", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Tokenización" }).click();
  await expect(page).toHaveURL(/\/tokenization$/);
});

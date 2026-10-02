import { test, expect, DEMO_STATE } from "./fixtures";

test.use({ storageState: DEMO_STATE });

test("chat appends a sent message", async ({ page }) => {
  await page.goto("/chat");
  await expect(page.getByText("Asistente AI")).toBeVisible();
  const input = page.getByPlaceholder("Escribe tu mensaje...");

  // The chat is a local mock: sending only appends the user's bubble (no assistant reply yet).
  await input.fill("Hola, ¿qué proyectos hay?");
  await input.press("Enter");
  await expect(page.getByText("Hola, ¿qué proyectos hay?")).toBeVisible();
  await expect(input).toHaveValue("");

  // Empty input is ignored (the message is not sent again).
  await input.press("Enter");
  await expect(page.getByText("Hola, ¿qué proyectos hay?")).toHaveCount(1);
});

test("tokenization landing renders and rotates the hero label", async ({ page }) => {
  await page.goto("/tokenization");
  await expect(page.getByText("Multiplica las fuentes de financiamiento")).toBeVisible();

  const label = page.locator("div.animate-fade-in-out span.font-semibold");
  await expect(label).toBeVisible();
  const first = await label.textContent();
  // Rotates every 2.2 s.
  await expect.poll(() => label.textContent(), { timeout: 8_000 }).not.toBe(first);

  for (const name of ["Aplicar como Desarrollador", "Agendar Reunión"]) {
    await expect(page.getByRole("button", { name })).toBeEnabled();
  }
});

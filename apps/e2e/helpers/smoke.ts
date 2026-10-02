import { expect, type Page } from "@playwright/test";

/**
 * Console errors to ignore. Keep empty unless a specific, unrelated error is
 * understood; add a commented pattern per entry.
 */
const IGNORED_CONSOLE: RegExp[] = [];

const ERROR_TEXT = "Application error: a client-side exception has occurred";

function isExternal(page: Page, url: string) {
  const current = page.url();
  if (!url || current === "about:blank") return false;
  return new URL(url).origin !== new URL(current).origin;
}

/** Collects page errors, console errors and failed responses for a page. */
export function trackErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    // Third-party assets (e.g. decorative SVGs) failing is not an app error.
    if (text.startsWith("Failed to load resource") && isExternal(page, msg.location().url)) return;
    if (IGNORED_CONSOLE.some((re) => re.test(text))) return;
    errors.push(`console.error: ${text}`);
  });
  page.on("response", (res) => {
    const url = new URL(res.url());
    if (res.status() < 400) return;
    if (isExternal(page, res.url())) return;
    if (url.pathname.startsWith("/_next") || url.pathname === "/favicon.ico") return;
    if (url.pathname.startsWith("/api/") || res.request().resourceType() === "document") {
      errors.push(`HTTP ${res.status()}: ${res.url()}`);
    }
  });

  return errors;
}

export async function expectNoRenderError(page: Page, errors: string[]) {
  await expect(page.locator("body")).toBeVisible();
  expect(page.url(), "redirected to /login (auth failed)").not.toContain("/login");
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  await expect(page.getByText(ERROR_TEXT)).toHaveCount(0);
  expect(errors, errors.join("\n")).toEqual([]);
}

/** Visits `path` and fails on non-2xx, page errors, console errors or a login redirect. */
export async function expectPageRenders(page: Page, path: string) {
  const errors = trackErrors(page);
  const res = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(res, `no response for ${path}`).not.toBeNull();
  expect(res!.ok(), `${path} -> HTTP ${res!.status()} (${res!.url()})`).toBe(true);
  await page.waitForLoadState("networkidle");
  await expectNoRenderError(page, errors);
}

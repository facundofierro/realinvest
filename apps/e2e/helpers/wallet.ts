import { expect, type Page } from "@playwright/test";

type Balance = { currencyCode: string; available: number; locked: number };
type Transaction = {
  id: string;
  type: string;
  status: string;
  amount: { amount: number; currencyCode: string };
  metadata?: Record<string, unknown> | null;
};

/**
 * USDT available balance. GET /api/wallet/balances first runs
 * syncPendingCustodyState, so polling it also drives custody settlement.
 */
export async function getUsdtBalance(page: Page) {
  const balances = await getBalances(page);
  return balances.find((b) => b.currencyCode === "USDT")?.available ?? 0;
}

export async function getBalances(page: Page) {
  const res = await page.request.get("/api/wallet/balances");
  expect(res.ok(), `GET /api/wallet/balances -> ${res.status()}`).toBe(true);
  return ((await res.json()) as { balances: Balance[] }).balances;
}

export async function getTransactions(page: Page) {
  const res = await page.request.get("/api/transactions");
  expect(res.ok(), `GET /api/transactions -> ${res.status()}`).toBe(true);
  return ((await res.json()) as { transactions: Transaction[] }).transactions;
}

export async function getHoldings(page: Page) {
  const res = await page.request.get("/api/wallet/holdings");
  expect(res.ok()).toBe(true);
  return ((await res.json()) as { holdings: { tokenId: string; tokens: number; tokenSymbol: string }[] }).holdings;
}

export async function getPositions(page: Page) {
  const res = await page.request.get("/api/wallet/positions");
  expect(res.ok()).toBe(true);
  return ((await res.json()) as {
    positions: { id: string; tokenId: string; tokenSymbol: string; side: string; status: string; totalAmount: number; filledAmount: number }[];
  }).positions;
}

/**
 * Polls `read` until `predicate` holds. Custody mock timings: transfers confirm
 * after 1 s and complete after 2 s; ramps complete after 2 s.
 */
export async function waitForCustodySettlement<T>(
  read: () => Promise<T>,
  predicate: (value: T) => boolean,
  { timeout = 15_000, message }: { timeout?: number; message?: string } = {},
) {
  await expect
    .poll(async () => predicate(await read()), { intervals: [500, 1000], timeout, message })
    .toBe(true);
}

/** Simulates `times` 100 USDT deposits from /deposit and waits until they settle. */
export async function fundWallet(page: Page, times = 1) {
  const start = await getUsdtBalance(page);
  await page.goto("/deposit");
  const button = page.getByRole("button", { name: "Simular depósito de 100 USDT" });
  for (let i = 0; i < times; i++) {
    await expect(button).toBeEnabled();
    const response = page.waitForResponse(
      (r) => r.url().endsWith("/api/wallet/deposit") && r.request().method() === "POST",
    );
    await button.click();
    expect((await response).status()).toBe(201);
    await expect(page.getByText("Depósito enviado")).toBeVisible();
  }
  const target = start + 100 * times;
  await waitForCustodySettlement(() => getUsdtBalance(page), (b) => b >= target, {
    message: `USDT balance >= ${target}`,
  });
}

# e2e

Playwright tests for the admin and wallet apps: a smoke pass over every route,
plus use-case specs (KYC, deposit/withdraw, exchange, primary purchases, assets,
admin CRUD) that run against the real apps with every external provider mocked.

## Prerequisites

```sh
pnpm install
pnpm --filter e2e install:browsers
```

## Run

```sh
pnpm e2e                          # from the repo root
pnpm --filter e2e test:admin      # admin only
pnpm --filter e2e test:wallet     # wallet only
pnpm exec playwright test kyc.spec.ts   # one spec, from apps/e2e
E2E_SKIP_SEED=1 pnpm e2e          # skip migrate + seed (fast local iteration)
```

> **`pnpm e2e` resets your local dev data.** Global setup runs
> `db:migrate` and `db:seed` against `packages/db/wallet.db` on every run
> (users, KYC applications, custody vaults, trades, everything). Use
> `E2E_SKIP_SEED=1` to keep the current data, or point the suite at another DB
> with `E2E_DATABASE_URL`.

Playwright starts both dev servers (`webServer`) with `DATABASE_URL` set to the
test DB, `E2E_AUTH_BYPASS=1` and `AUTH_URL` pointing at the wallet. It reuses
servers already running on the ports unless `CI` is set. If you start them
yourself:

- **wallet** needs `E2E_AUTH_BYPASS=1` (otherwise login fails with a hint).
- **admin** must read the same DB. Without `DATABASE_URL` it falls back to an
  empty `apps/admin/wallet.db`; global setup detects that and fails. Add
  `apps/admin/.env.local` (gitignored) with
  `DATABASE_URL=file:../../packages/db/wallet.db`, or start it with that env.

Override URLs with `ADMIN_URL` (default `http://localhost:47311`) and
`WALLET_URL` (default `http://localhost:47310`).

## Identities

Google OAuth is not exercised. With `E2E_AUTH_BYPASS=1` (ignored when
`NODE_ENV=production`) the wallet enables an `e2e` Credentials provider
(`apps/wallet/src/auth.ts`) that accepts a `userId`:

- `demo-user` (default): the seeded user with holdings, positions and
  transactions. Global setup saves its session to `.auth/wallet.json`; specs
  that only read seeded data use `test.use({ storageState: DEMO_STATE })`.
- `e2e-*`: created on demand. Every mutating test gets its own fresh user, so
  KYC state (which only moves forward per user) and balances never leak
  between tests.

Fixtures (`fixtures.ts`, import `test`/`expect` from there):

| Fixture | Gives you |
|---|---|
| `freshUser` | `{ page, userId }`: new `e2e-*` user, KYC none, 0 USDT |
| `approvedUser` | `freshUser` after an instantly approved KYC |
| `fundedUser` | `approvedUser` with one settled 100 USDT deposit |
| `net` (auto) | third-party stubs; fails the test on any unstubbed external request |
| `pageErrors` (auto) | fails the test on any uncaught page error |

## Helpers

- `helpers/auth.ts`: `loginAs(request, userId)`, `getSession`, `newUserId`.
- `helpers/network.ts`: `stubThirdParty(context)` serves QR codes
  (api.qrserver.com), Unsplash images, avatars and decorative SVGs from
  fixtures, and aborts any other external request (`net.escaped`).
  `net.hits[host]` records stubbed requests.
- `helpers/kyc.ts`: `fillKycWizard`, `approveKyc`, `submitPendingKyc`,
  `rejectKyc`, `waitForSessionKyc`, `expectSessionKyc`. Outcomes follow the mock
  rules: a file name containing `approve`/`reject` decides instantly,
  `pep`/`sanction` rejects via screening, anything else stays pending.
- `helpers/wallet.ts`: `fundWallet(page, times)`, `waitForCustodySettlement`,
  `getUsdtBalance`, `getTransactions`, `getHoldings`, `getPositions`.
- `helpers/db.ts` (direct `@libsql/client` access, for states the UI cannot
  reach): `forceNextCustodyOutcome(userId, "transfer" | "ramp", "FAILED")`,
  `setUsdtBalance`, `addHolding`.
- `helpers/smoke.ts`: `expectPageRenders`, `trackErrors`.

### Timings the waits rely on

| Mock | Timing |
|---|---|
| Custody transfer | CONFIRMING after 1 s, final after 2 s (settled lazily on read) |
| Custody ramp (deposit) | final after 2 s |
| KYC pending | auto-approves 15 s after submit; `/kyc` polls every 3 s |
| Withdraw / purchase status | the page polls transactions every 1 s while in flight |

Never use `waitForTimeout`; poll with `expect.poll` / `waitForCustodySettlement`.

Do not poll `/api/auth/session` from the test while the page is updating the
session (after a KYC submit): a concurrent GET re-issues the old JWT cookie and
can overwrite the new one. Use `waitForSessionKyc` first.

## Specs

| Spec | Covers |
|---|---|
| `wallet.spec.ts`, `admin.spec.ts` | smoke: every route renders without errors; nav |
| `auth-session.spec.ts` | login redirect / 401, account overlay, sign-out |
| `kyc.spec.ts` | approve, reject (PEP, filename, screening), pending → auto-approve, deposit/withdraw gates |
| `deposit-withdraw.spec.ts` | address + QR + copy, simulated deposit, failed deposit, withdraw validation / success / failure, API errors |
| `exchange.spec.ts` | list tabs + sorting, order details, detail page, market BUY, LIMIT + cancel, error paths, KYC gate |
| `invest-purchase.spec.ts` | `/invest` filters, project tabs, units filters/labels, tokenized purchase, guards, advisor form |
| `assets.spec.ts` | portfolio, empty state, INVERTIR order, KYC gate |
| `misc.spec.ts` | chat, tokenization landing |
| `shell.spec.ts` | desktop top nav (launch notice, Tokenización) |
| `admin-crud.spec.ts` | dashboard stats, property create/edit, skeleton + empty state, activity filters, chat |

## Notes

- `e2e` is intentionally not part of `turbo run test`: it needs live servers and
  a browser.
- Runs are serial (`workers: 1`): specs share the seeded catalog (unit token
  counts, admin edits).
- Console allowlist entries in `helpers/smoke.ts` are only for specific,
  understood noise (currently: seeded project images, which the admin does not
  serve).

# e2e

Playwright smoke tests: visit every route of the admin and wallet apps and fail on
page errors, console errors, non-2xx responses, the Next.js error overlay, or a
redirect to `/login`.

## Prerequisites

```sh
pnpm install
pnpm --filter e2e install:browsers
pnpm db:seed          # tests assume a migrated, seeded DB (demo-user, projects, markets)
```

## Run

```sh
pnpm e2e                          # from the repo root
pnpm --filter e2e test:admin      # admin only
pnpm --filter e2e test:wallet     # wallet only
pnpm exec playwright test         # from apps/e2e
```

Playwright starts both dev servers (`webServer`). It reuses servers already
running on the ports unless `CI` is set. A server you start yourself must have
`E2E_AUTH_BYPASS=1` for the wallet, otherwise global setup fails with a hint.

Override URLs with `ADMIN_URL` (default `http://localhost:47311`) and
`WALLET_URL` (default `http://localhost:47310`).

## Wallet auth

Google OAuth is not exercised. With `E2E_AUTH_BYPASS=1` (ignored when
`NODE_ENV=production`) `apps/wallet/src/auth.ts` enables an extra `e2e`
Credentials provider that signs in `demo-user`. `global-setup.ts` logs in
through it and saves the real Auth.js session cookie to `.auth/wallet.json`.

## Notes

- `e2e` is intentionally not part of `turbo run test`: it needs live servers and
  a browser.
- Routes with known pre-existing errors are `test.fixme` in `wallet.spec.ts`
  (`KNOWN_BROKEN`). Add console allowlist entries in `helpers/smoke.ts` only for
  specific, understood noise.

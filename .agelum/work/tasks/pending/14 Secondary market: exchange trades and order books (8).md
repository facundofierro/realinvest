---
workflowStatus: pending
---

---
title: Secondary market: exchange trades and order books
created: 2026-09-21T12:30:00.000Z
type: task
state: pending
priority: 14
storyPoints: 8
epic: alpha-version
---

# Secondary market: exchange trades and order books

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Connect the exchange screens to real persisted order books and trades: place buy/sell orders on market tokens through the trade dialog, match against the book (simple price-time matching is enough for alpha), update order book levels, balances, holdings/positions and transaction history atomically. Chart/series endpoints should derive from persisted trades where feasible.

## Related Source Code
- [ ] apps/wallet/src/components/pages/exchange-page.tsx:1
- [ ] apps/wallet/src/components/pages/exchange-detail-page.tsx:1
- [ ] apps/wallet/src/components/pages/exchange-page-client.tsx:1
- [ ] apps/wallet/src/components/exchange/trade-dialog.tsx:281
- [ ] apps/wallet/src/components/exchange/market-stats.tsx:1
- [ ] apps/wallet/src/components/exchange/charts.tsx:1
- [ ] apps/wallet/src/components/desktop-token-tabs.tsx:1
- [ ] apps/wallet/src/app/api/market/orderbook/route.ts:1
- [ ] apps/wallet/src/app/api/market/tokens/route.ts:1
- [ ] apps/wallet/src/app/api/market/series/route.ts:1
- [ ] apps/wallet/src/hooks/use-queries.ts:22

## Acceptance Criteria
- [ ] Buy/sell orders can be placed and matched; order book updates
- [ ] Balances, holdings, positions and transactions are updated atomically per trade
- [ ] Insufficient funds/holdings and non-KYC cases are rejected
- [ ] Charts and stats reflect persisted trades
- [ ] Tests cover matching logic
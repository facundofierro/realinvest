# Assets/portfolio screen wired to real data — implementation summary

Implemented the plan in the wallet UI, preserving the existing database-backed query and trade flow work.

- Added `computeHoldingsTotals` to calculate portfolio value, cost basis, and unrealized P&L from holdings. Missing cost basis uses the holding's market price, contributing zero P&L.
- Updated desktop and mobile assets views to show calculated P&L, loading and retryable error states, and an empty holdings prompt while retaining USDT liquidity controls.
- Replaced fabricated token detail objects with the matching `MarketToken` records for desktop tabs and the mobile unit dialog.
- Updated the dashboard greeting from the current user's name, calculated the balance and unrealized P&L from real holdings and cash, and added retryable error and empty activity states.
- Invalidated the market token query after a successful investment purchase so token details refresh.

Validation: `git diff --check` passed. Targeted ESLint completed with zero errors and five existing unused-symbol warnings. `pnpm -F wallet exec tsc --noEmit` remains blocked by the pre-existing `src/lib/api/trading.ts:152` reference to undefined `buyUserId`.

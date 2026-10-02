# Secondary market: exchange trades and order books

Implemented the exchange trading plan with persisted order matching, order-book depth, trade history, asynchronous USDT settlement, and order cancellation.

## Changes made

- Added `holdings.lockedTokens` and a persisted `trades` table; removed the unused `order_book_levels` schema and seed path. Generated migration `0004_vengeful_sentinels.sql` with Drizzle.
- Added a seeded system market maker with reusable resting liquidity and a market matching engine with price-time priority, self-trade prevention, balance/holding reservations, and limit/market order handling.
- Added atomic order cancellation and a dedicated cancel API route; routed order creation through the matching engine and returned structured trading errors.
- Extended custody reconciliation for buyer and seller trade legs, and derived live order-book depth and chart series from open positions and persisted trades.
- Updated client cancellation routing and order mutation cache invalidation. Market-maker USDT projection is initialized once so later reads cannot reset its balance.

## Validation

- Drizzle migration generation completed successfully.
- Tests and type checks were not run.

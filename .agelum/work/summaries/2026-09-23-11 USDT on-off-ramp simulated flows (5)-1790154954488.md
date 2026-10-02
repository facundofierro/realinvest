# USDT on/off-ramp simulated flows — summary

Implemented the wallet-side simulated USDT custody flows.

- Added a wallet custody-provider accessor and a custody orchestration module that bootstraps one USDT-enabled vault per user, creates deposit addresses, creates simulated on-ramp requests, and synchronizes pending provider state into the existing balance and transaction projections.
- Replaced the hard-coded deposit address with a KYC-gated custody address response including QR payload data. The Deposit screen now renders a scannable QR, copies the actual address, and offers a visible simulated 100-USDT deposit action.
- Replaced the direct withdrawal transaction insert with a KYC-gated custody transfer. It validates a destination address and funds, applies the server-owned 1-USDT fee, immediately reserves the total debit, records transaction metadata, and reconciles completed or failed transfers back into the projections.
- Updated balances and transaction endpoints to synchronize pending custody work before reading. Wallet balance and transaction queries poll every three seconds so deposit crediting and withdrawal lifecycle states become visible automatically.
- Added client-side structured API errors, proper cache invalidation, withdrawal confirmation, fee/total display, field-level validation, and pending/confirming/completed/failed status feedback.
- Added the custody workspace dependencies to the wallet and adjusted the mock decimal helper so the wallet's TypeScript compilation can consume it.

Validation completed:

- `pnpm --filter wallet exec tsc --noEmit`
- `pnpm --filter @repo/fireblocks-mock check-types`
- `pnpm --filter @repo/fireblocks-mock test` (8 tests passed)

`pnpm --filter wallet lint` still reports two pre-existing React hook rule errors in KYC files unrelated to this work, plus existing warnings.

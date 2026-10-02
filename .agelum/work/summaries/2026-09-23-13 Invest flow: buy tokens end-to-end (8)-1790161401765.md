# Invest flow: buy tokens end-to-end — Summary

Implemented the primary-market token purchase flow for tokenized project units.

## Changes made

- Added `purchaseUnitTokens` request-time logic with unit/supply/balance validation, USDT custody transfer to the platform treasury, immediate balance reservation, and a `PENDING` BUY transaction.
- Added atomic settlement effects for holdings, filled BUY positions, unit supply, and unit-linked market tokens; failed settlement refunds the reserved balance.
- Extended custody reconciliation to dispatch BUY transfers and wired it into holdings, positions, and project-unit read routes.
- Added the KYC-protected `POST /api/projects/[id]/units/[unitId]/purchase` endpoint, client API method, and React Query mutation/invalidation hook.
- Added the two-step investment confirmation dialog with amount controls, balance/supply validation, pending settlement feedback, and completed/failed outcomes.
- Rewired tokenized unit CTAs to open the purchase dialog, while preserving the contact-advisor flow for whole-property units; unavailable tokenized units now have a disabled invest action.
- Added shared USD-price parsing used by server and UI code.

## Verification

- `pnpm --filter wallet exec tsc --noEmit` passed.
- Scoped ESLint completed with no errors (existing unused-import warnings remain in older page/dialog files).
- `git diff --check` passed.

The initial full Next production build was stopped because it remained stuck holding the Next build lock; TypeScript compilation completed successfully afterward.

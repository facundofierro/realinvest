# KYC gating of invest, deposit and withdraw — summary

Implemented the plan’s KYC gate across wallet money-moving flows.

- Added a server-side live KYC guard (`checkKycApproved`) that consults the KYC provider rather than stale session claims and returns a machine-readable `403 kyc_required` response.
- Added localized blocked-state dialog UI and a shared client `useKycGate` hook; mounted the KYC locale provider at the app-provider level.
- Gated position creation, withdrawal creation, and deposit-address retrieval on KYC approval.
- Replaced the position stub with persisted position creation and connected all existing trade/invest confirmation paths to it.
- Added minimal withdrawal persistence as a pending USDT transaction, plus client mutations/query hooks for withdrawal and deposit address.
- Updated deposit and withdraw screens to use the new APIs and display the KYC blocked dialog where appropriate.

Known simplification: creating a position deliberately does not lock or deduct balances; full trading-ledger behavior is outside this KYC-gating task.

Validation:

- `pnpm exec tsc --noEmit -p apps/wallet/tsconfig.json` passed.
- `git diff --check` passed.
- `pnpm --filter wallet lint` still fails on two pre-existing React-hook lint errors in the existing KYC locale/onboarding files, plus existing warnings; no lint errors were introduced by this implementation.

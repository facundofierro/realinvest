# Summary: Define KYC provider port and `packages/providers-kyc`

Implemented the KYC persistence boundary and deterministic mock provider described in the plan.

## Changes made

- Added `kyc_applications` to `packages/db/src/schema.ts` with one application per user, JSON-backed application data, lifecycle timestamps, status index, and cascade user foreign key.
- Added KYC relations and inferred `KycApplicationRow` / `NewKycApplicationRow` types.
- Generated and applied additive migration `packages/db/drizzle/0001_new_omega_red.sql`, with its Drizzle journal and snapshot updates.
- Added the workspace package `@repo/providers-kyc` with shared TypeScript and ESLint configuration.
- Defined provider- and jurisdiction-agnostic KYC types plus the `KycProvider` port (`getStatus`, `getApplication`, and `submitApplication`).
- Implemented `createMockKycProvider`, backed by `@repo/db`. It supports resubmission via upsert, mirrors every status transition to `users.kyc_status`, and lazily auto-approves pending applications using an injectable clock.
- Added documented deterministic filename rules: screening keywords reject first, then `reject`, then `approve`, otherwise pending and auto-approved after the configured delay.
- Added package documentation covering the port, persistence model, mock behavior, configuration, fake-clock support, and wallet wiring boundary.
- Updated `pnpm-lock.yaml` after linking the new workspace package.

## Verification

- `pnpm db:generate` — succeeded.
- `pnpm db:migrate` — succeeded.
- `pnpm --filter @repo/db check-types` — succeeded.
- `pnpm --filter @repo/providers-kyc check-types` — succeeded.
- `pnpm --filter @repo/providers-kyc lint` — succeeded.
- `git diff --check` — succeeded.

Unit tests were intentionally not introduced because the plan explicitly defers choosing a test framework and implementing state-transition tests to a separate testing pass.

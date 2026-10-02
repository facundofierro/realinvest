# Summary: Define custody provider port (packages/providers-custody)

Implemented the provider-agnostic `@repo/providers-custody` workspace package.

## Changes made

- Added custody domain types for vault accounts, balances, deposit addresses, transfers, on/off-ramp requests, and token administration.
- Added the `CustodyProvider` port with provider-neutral operations and a typed custody error hierarchy.
- Added an exported Vitest conformance suite at `@repo/providers-custody/conformance`, including optional simulated funding and settlement hooks.
- Added an internal generic in-memory reference provider and self-test for the conformance suite.
- Added package documentation covering contracts, error handling, and conformance-suite consumption.
- Added a root Turbo `test` task and root test script; installed Vitest and updated the lockfile.

## Verification

- `pnpm --filter @repo/providers-custody lint` — passed
- `pnpm --filter @repo/providers-custody test` — passed (8 tests)
- `pnpm --filter @repo/providers-custody check-types` — passed
- `git diff --check` — passed

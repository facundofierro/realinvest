# Implement `@repo/fireblocks-mock`

## Delivered

- Added the `@repo/fireblocks-mock` workspace package with `createFireblocksMock` and `createFireblocksMockWithControls` exports.
- Implemented the complete `CustodyProvider` contract with persisted Fireblocks-style vaults, enabled assets, decimal-string balances, deposit addresses, transfers, ramps, eligibility, freezes, pauses, and idempotent mint/burn operations.
- Added deterministic lifecycle simulation. Transfers progress `SUBMITTED -> CONFIRMING -> COMPLETED/FAILED`; ramp requests settle lazily. Persisted due timestamps and intended outcomes make lifecycle progress restart-safe.
- Added `@repo/db` custody-native schema tables, inferred types, and generated append-only migration `0003_eminent_gamora.sql` with snapshot and journal updates.
- Added README usage and behavior documentation, explicitly noting that wallet-summary table projection is intentionally deferred.
- Added a package-local conformance test using isolated SQLite databases and deterministic `fund` / `settle` controls.

## Verification

- `pnpm --filter @repo/fireblocks-mock test` — passed (8 tests)
- `pnpm --filter @repo/fireblocks-mock lint` — passed
- `pnpm --filter @repo/fireblocks-mock check-types` — passed
- `pnpm --filter @repo/db check-types` — passed
- `git diff --check` — passed

## Notes

The shared worktree already contained concurrent changes to the root Ripio cleanup files. Those changes remove the stale script/environment references and were preserved; this implementation did not overwrite them.

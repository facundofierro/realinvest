# @repo/providers-custody

Provider-agnostic custody port for vault accounts, enabled assets, balances, deposit addresses, transfers, fiat on/off-ramp requests, and token administration (eligibility, account freezes, asset pauses, minting, and burning).

All amounts are decimal strings. The package has no runtime dependencies, no database dependency, no Fireblocks-specific vocabulary, and no wallet-app wiring.

## Contract

- Unknown `getVaultAccount`, `getTransfer`, and `getRampRequest` calls return `null`; operations using an unknown vault account throw `VaultAccountNotFoundError`.
- Balances and deposit addresses require the asset to have first been enabled on the vault account.
- `createTransfer` and `createRampRequest` are idempotent by `idempotencyKey` when called with equivalent input.
- Enabled assets start eligible and unfrozen. Assets can be paused globally.
- Transfer validation is ordered: source exists, source asset enabled, asset not paused, source not frozen, source eligible, then (for internal transfers) destination exists/enabled/not frozen/eligible, then sufficient source available balance.
- Mint and burn respect asset pauses; burn also requires sufficient available balance. They do not depend on eligibility or freeze state.

Errors extend `CustodyProviderError` and expose a `code` discriminant. Specific errors cover unknown accounts, disabled assets, insufficient balance, invalid destinations, unknown transfers/ramp requests, unsupported assets, validation, frozen accounts, paused assets, and ineligible accounts.

## Conformance suite

Adapters can register the reusable Vitest suite:

```ts
import { runCustodyProviderConformanceSuite } from "@repo/providers-custody/conformance";

runCustodyProviderConformanceSuite(
  () => createProvider(),
  { fund: async () => {}, settle: async () => {} },
);
```

`fund` and `settle` are optional simulation hooks. Without `fund`, funded transfer happy-path tests are skipped; without `settle`, asynchronous lifecycle-completion tests are skipped.

The Fireblocks-flavored, database-persisted mock belongs in the separate `@repo/fireblocks-mock` package; this package defines only the port and its generic internal reference adapter.

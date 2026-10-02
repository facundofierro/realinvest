# @repo/fireblocks-mock

Deterministic, Fireblocks-flavoured implementation of the provider-agnostic `@repo/providers-custody` port. It persists provider-native vault accounts, assets, balances, deposit addresses, transfers, ramps, and token-administration state in `@repo/db`.

Apply the `@repo/db` migrations before using it. The custody tables are the source of truth; this package deliberately does not project data into the wallet app's user-summary `balances` or `transactions` tables.

```ts
import { createFireblocksMock } from "@repo/fireblocks-mock";

const custody = createFireblocksMock(db, {
  transferConfirmingDelayMs: 1_000,
  transferCompletionDelayMs: 2_000,
  defaultTransferOutcome: "COMPLETED",
});
```

Transfers start as `SUBMITTED`, progress lazily to `CONFIRMING`, and finish as `COMPLETED` or `FAILED`; ramps finish lazily as well. Due times and intended outcomes are persisted, so progress survives process restarts. Tests and demos can use `createFireblocksMockWithControls`, which additionally provides deterministic `fund` and `settle` helpers. Supply `now`, delay options, default outcomes, or idempotency-keyed outcomes to control simulation deterministically.

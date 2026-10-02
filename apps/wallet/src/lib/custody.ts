import { createFireblocksMock } from "@repo/fireblocks-mock";
import type { CustodyProvider } from "@repo/providers-custody";
import { getDb } from "@/lib/db";

const globalForCustody = globalThis as unknown as { custodyProvider?: CustodyProvider };

/** The mock is process-local, while its state is persisted in the application DB. */
export function getCustodyProvider(): CustodyProvider {
  return (globalForCustody.custodyProvider ??= createFireblocksMock(getDb()));
}

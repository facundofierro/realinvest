import { balances, transactions } from "@repo/db";
import { CustodyProviderError, type Transfer } from "@repo/providers-custody";
import { and, eq, sql } from "drizzle-orm";
import { getCustodyProvider } from "@/lib/custody";
import { getDb } from "@/lib/db";
import { PurchaseError, applyPurchaseEffects } from "./invest";

export const USDT_ASSET_ID = "USDT";
export const WITHDRAWAL_FEE_USDT = 1;
export const SIMULATED_DEPOSIT_USDT = 100;

type CustodyMetadata = Record<string, unknown> & {
  transferId?: string;
  rampRequestId?: string;
  fee?: number;
  totalDebit?: number;
  projected?: boolean;
  custodyStatus?: string;
};

function metadata(row: { metadata: Record<string, unknown> | null }): CustodyMetadata {
  return (row.metadata ?? {}) as CustodyMetadata;
}

export async function ensureProjectionBalance(userId: string) {
  await getDb().insert(balances).values({ userId, currencyCode: "USDT" }).onConflictDoNothing();
}

const TREASURY_CUSTOMER_REF_ID = "platform-treasury";

export async function getOrCreatePlatformTreasuryVault() {
  const provider = getCustodyProvider();
  const vault = (await provider.listVaultAccounts()).find((item) => item.customerRefId === TREASURY_CUSTOMER_REF_ID)
    ?? await provider.createVaultAccount({ name: "Platform Treasury", customerRefId: TREASURY_CUSTOMER_REF_ID });
  if (!(await provider.listEnabledAssets(vault.id)).includes(USDT_ASSET_ID)) {
    await provider.enableAsset(vault.id, USDT_ASSET_ID);
  }
  return vault;
}

export async function getOrCreateCustodyVault(userId: string) {
  const provider = getCustodyProvider();
  const vault = (await provider.listVaultAccounts()).find((item: { customerRefId: string | null }) => item.customerRefId === userId)
    ?? await provider.createVaultAccount({ name: `Wallet ${userId.slice(0, 8)}`, customerRefId: userId });
  if (!(await provider.listEnabledAssets(vault.id)).includes(USDT_ASSET_ID)) {
    await provider.enableAsset(vault.id, USDT_ASSET_ID);
  }
  await ensureProjectionBalance(userId);
  return vault;
}

export async function getDepositDetails(userId: string) {
  const provider = getCustodyProvider();
  const vault = await getOrCreateCustodyVault(userId);
  const address = (await provider.listDepositAddresses(vault.id, USDT_ASSET_ID))[0]
    ?? await provider.createDepositAddress(vault.id, USDT_ASSET_ID);
  return { vault, address };
}

export async function simulateDeposit(userId: string, amount = SIMULATED_DEPOSIT_USDT) {
  const { vault, address } = await getDepositDetails(userId);
  const ramp = await getCustodyProvider().createRampRequest({
    vaultAccountId: vault.id,
    direction: "ON_RAMP",
    fiatCurrency: "USD",
    fiatAmount: String(amount),
    assetId: USDT_ASSET_ID,
    assetAmount: String(amount),
    idempotencyKey: crypto.randomUUID(),
    paymentReference: address.address,
  });
  const [transaction] = await getDb().insert(transactions).values({
    userId,
    type: "DEPOSIT",
    status: "PENDING",
    amount,
    currencyCode: "USDT",
    description: "Simulated USDT deposit",
    metadata: { rampRequestId: ramp.id, address: address.address, network: "TRC20", custodyStatus: ramp.status },
  }).returning();
  return transaction;
}

export async function createCustodyWithdrawal(userId: string, input: { amount: number; address: string }) {
  const totalDebit = input.amount + WITHDRAWAL_FEE_USDT;
  await ensureProjectionBalance(userId);
  const [projection] = await getDb().select().from(balances)
    .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
  if (!projection || projection.available < totalDebit) {
    throw new CustodyProviderError("INSUFFICIENT_BALANCE", "Insufficient USDT balance after the 1 USDT network fee");
  }

  const vault = await getOrCreateCustodyVault(userId);
  const transfer = await getCustodyProvider().createTransfer({
    assetId: USDT_ASSET_ID,
    amount: String(input.amount),
    sourceVaultAccountId: vault.id,
    destination: { type: "ONE_TIME_ADDRESS", address: input.address },
    idempotencyKey: crypto.randomUUID(),
    note: "Wallet withdrawal",
  });

  // Reserve the whole debit immediately, before the mock transfer settles.
  await getDb().update(balances).set({
    available: sql`${balances.available} - ${totalDebit}`,
    locked: sql`${balances.locked} + ${totalDebit}`,
  }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
  const [transaction] = await getDb().insert(transactions).values({
    userId,
    type: "WITHDRAWAL",
    status: "PENDING",
    amount: input.amount,
    currencyCode: "USDT",
    description: `Withdrawal to ${input.address}`,
    metadata: { transferId: transfer.id, address: input.address, destinationAddress: input.address, network: "TRC20", fee: WITHDRAWAL_FEE_USDT, totalDebit, custodyStatus: transfer.status },
  }).returning();
  return transaction;
}

async function settleWithdrawal(userId: string, row: typeof transactions.$inferSelect, transfer: Transfer) {
  const details = metadata(row);
  if (details.projected) return;
  const totalDebit = Number(details.totalDebit ?? row.amount + Number(details.fee ?? WITHDRAWAL_FEE_USDT));
  if (transfer.status === "COMPLETED") {
    await getDb().update(balances).set({ locked: sql`MAX(0, ${balances.locked} - ${totalDebit})` })
      .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
  } else if (transfer.status === "FAILED") {
    await getDb().update(balances).set({
      available: sql`${balances.available} + ${totalDebit}`,
      locked: sql`MAX(0, ${balances.locked} - ${totalDebit})`,
    }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
  } else return;
  await getDb().update(transactions).set({
    status: transfer.status === "COMPLETED" ? "COMPLETED" : "FAILED",
    metadata: { ...details, projected: true, custodyStatus: transfer.status, failureReason: transfer.failureReason },
  }).where(eq(transactions.id, row.id));
}

async function settlePurchase(userId: string, row: typeof transactions.$inferSelect, transfer: Transfer) {
  const details = metadata(row);
  if (details.projected) return;
  const totalDebit = Number(details.totalDebit ?? row.amount);
  if (transfer.status === "COMPLETED") {
    try {
      await applyPurchaseEffects(userId, {
        unitId: details.unitId as string,
        tokenAmount: details.tokenAmount as number,
        pricePerToken: details.pricePerToken as number,
      });
      await getDb().update(balances).set({ locked: sql`MAX(0, ${balances.locked} - ${totalDebit})` })
        .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
      await getDb().update(transactions).set({ status: "COMPLETED", metadata: { ...details, projected: true, custodyStatus: transfer.status } })
        .where(eq(transactions.id, row.id));
    } catch (error) {
      const failureReason = error instanceof PurchaseError ? error.message : "Settlement failed";
      await getDb().update(balances).set({
        available: sql`${balances.available} + ${totalDebit}`,
        locked: sql`MAX(0, ${balances.locked} - ${totalDebit})`,
      }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
      await getDb().update(transactions).set({ status: "FAILED", metadata: { ...details, projected: true, custodyStatus: transfer.status, failureReason } })
        .where(eq(transactions.id, row.id));
    }
  } else if (transfer.status === "FAILED") {
    await getDb().update(balances).set({
      available: sql`${balances.available} + ${totalDebit}`,
      locked: sql`MAX(0, ${balances.locked} - ${totalDebit})`,
    }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    await getDb().update(transactions).set({ status: "FAILED", metadata: { ...details, projected: true, custodyStatus: transfer.status, failureReason: transfer.failureReason } })
      .where(eq(transactions.id, row.id));
  }
}

async function settleTrade(userId: string, row: typeof transactions.$inferSelect, transfer: Transfer) {
  const details = metadata(row);
  if (details.projected) return;
  const totalUsd = Number(details.totalUsd ?? row.amount);
  if (transfer.status === "COMPLETED") {
    if (details.tradeRole === "buyer") {
      await getDb().update(balances).set({ locked: sql`MAX(0, ${balances.locked} - ${totalUsd})` })
        .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    } else {
      await ensureProjectionBalance(userId);
      await getDb().update(balances).set({ available: sql`${balances.available} + ${totalUsd}` })
        .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    }
    await getDb().update(transactions).set({ status: "COMPLETED", metadata: { ...details, projected: true, custodyStatus: transfer.status } })
      .where(eq(transactions.id, row.id));
  } else if (transfer.status === "FAILED") {
    if (details.tradeRole === "buyer") {
      await getDb().update(balances).set({
        available: sql`${balances.available} + ${totalUsd}`,
        locked: sql`MAX(0, ${balances.locked} - ${totalUsd})`,
      }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    }
    await getDb().update(transactions).set({ status: "FAILED", metadata: { ...details, projected: true, custodyStatus: transfer.status, failureReason: transfer.failureReason } })
      .where(eq(transactions.id, row.id));
  }
}

/** Resolve time-based mock operations and mirror their final states into app read models. */
export async function syncPendingCustodyState(userId: string) {
  const rows = await getDb().select().from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.status, "PENDING")));
  const provider = getCustodyProvider();
  for (const row of rows) {
    try {
      const details = metadata(row);
      if (details.rampRequestId) {
      const ramp = await provider.getRampRequest(details.rampRequestId);
      if (!ramp) continue;
      if (ramp.status === "COMPLETED" && !details.projected) {
        await ensureProjectionBalance(userId);
        await getDb().update(balances).set({ available: sql`${balances.available} + ${row.amount}` })
          .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
        await getDb().update(transactions).set({ status: "COMPLETED", metadata: { ...details, projected: true, custodyStatus: ramp.status } }).where(eq(transactions.id, row.id));
      } else if (ramp.status === "FAILED") {
        await getDb().update(transactions).set({ status: "FAILED", metadata: { ...details, projected: true, custodyStatus: ramp.status, failureReason: ramp.failureReason } }).where(eq(transactions.id, row.id));
      }
      } else if (details.transferId) {
      const transfer = await provider.getTransfer(details.transferId);
      if (transfer) {
        if (details.tradeId) await settleTrade(userId, row, transfer);
        else if (row.type === "BUY") await settlePurchase(userId, row, transfer);
        else await settleWithdrawal(userId, row, transfer);
        if (transfer.status !== details.custodyStatus && transfer.status !== "COMPLETED" && transfer.status !== "FAILED") {
          await getDb().update(transactions).set({ metadata: { ...details, custodyStatus: transfer.status } }).where(eq(transactions.id, row.id));
        }
      }
      }
    } catch {
      // A malformed or otherwise broken operation must not block other read models.
    }
  }
}

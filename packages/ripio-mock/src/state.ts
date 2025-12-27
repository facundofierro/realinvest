import crypto from "node:crypto";
import { readFixtureJson } from "./fixtures.js";

export type EndUserBalance = {
  currency: string;
  balance: number;
};

export type EndUserAddress = {
  network: string;
  end_user_id: string;
  address: string;
  xpub?: string;
  derivation_path?: string;
};

export type EndUserRecord = {
  id: string;
  balances: EndUserBalance[];
  addresses: EndUserAddress[];
};

export type WithdrawalRecord = {
  id: string;
  created_at: string;
  confirmation_date: string | null;
  txn_hash: string | null;
  end_user_id: string;
  currency: string;
  amount: number;
  address: string;
  charged_fee: number;
  network_name: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  external_ref?: string;
};

type State = {
  endUsers: EndUserRecord[];
  withdrawals: WithdrawalRecord[];
  issuedTokens: Set<string>;
};

let state: State | null = null;

export async function getState(): Promise<State> {
  if (state) return state;
  const [endUsers, withdrawals] = await Promise.all([
    readFixtureJson<EndUserRecord[]>("end-users.json"),
    readFixtureJson<WithdrawalRecord[]>("withdrawals.json"),
  ]);
  state = {
    endUsers,
    withdrawals,
    issuedTokens: new Set<string>(),
  };
  return state;
}

export async function resetState(): Promise<void> {
  state = null;
  await getState();
}

export function issueAccessToken(tokens: Set<string>): string {
  const token = `mock_${crypto.randomBytes(16).toString("hex")}`;
  tokens.add(token);
  return token;
}

export function isValidAccessToken(tokens: Set<string>, token: string): boolean {
  return tokens.has(token);
}

export function getOrCreateEndUser(endUsers: EndUserRecord[], endUserId: string): EndUserRecord {
  const existing = endUsers.find((u) => u.id === endUserId);
  if (existing) return existing;
  const created: EndUserRecord = {
    id: endUserId,
    balances: [],
    addresses: [],
  };
  endUsers.push(created);
  return created;
}

export function debitBalance(
  endUser: EndUserRecord,
  currency: string,
  amount: number,
): { ok: true } | { ok: false } {
  const bal = endUser.balances.find((b) => b.currency === currency);
  if (!bal) return { ok: false };
  if (bal.balance < amount) return { ok: false };
  bal.balance = Math.max(0, bal.balance - amount);
  return { ok: true };
}


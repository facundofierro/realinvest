import { createCustodyWithdrawal } from "./custody-wallet";

export async function createWithdrawal(userId: string, input: { amount: number; address: string }) {
  return createCustodyWithdrawal(userId, input);
}

import { readSampleJson } from "@/lib/sample-data";
import type { Position } from "@/types/wallet";

export async function getWalletPositions(): Promise<Position[]> {
  return await readSampleJson<Position[]>("walletPositions.json");
}

export async function createPosition(positionId: string): Promise<{ ok: boolean; positionId: string }> {
  // In a real app, this would create a position in the database
  return { ok: true, positionId };
}
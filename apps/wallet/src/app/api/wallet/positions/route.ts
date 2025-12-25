import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type { Position } from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const positions = await readSampleJson<Position[]>("walletPositions.json");
  return NextResponse.json({ positions });
}


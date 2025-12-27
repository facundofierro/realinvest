import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type { Position } from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const positions =
    await readSampleJson<Position[]>(
      "walletPositions.json"
    );
  return NextResponse.json({
    positions,
  });
}

export async function POST(
  request: Request
) {
  const body = (await request
    .json()
    .catch(() => null)) as {
    positionId?: unknown;
  } | null;

  const positionId =
    typeof body?.positionId === "string"
      ? body.positionId
      : null;

  if (!positionId) {
    return NextResponse.json(
      { error: "Invalid positionId" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    positionId,
  });
}

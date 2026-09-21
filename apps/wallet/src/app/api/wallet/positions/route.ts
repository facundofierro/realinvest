import { NextResponse } from "next/server";
import { getWalletPositions, createPosition } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireUser())) return unauthorizedResponse();
  const positions = await getWalletPositions();
  return NextResponse.json({ positions });
}

export async function POST(request: Request) {
  if (!(await requireUser())) return unauthorizedResponse();
  const body = (await request.json().catch(() => null)) as {
    positionId?: unknown;
  } | null;

  const positionId = typeof body?.positionId === "string" ? body.positionId : null;

  if (!positionId) {
    return NextResponse.json(
      { error: "Invalid positionId" },
      { status: 400 }
    );
  }

  const result = await createPosition(positionId);
  return NextResponse.json(result);
}

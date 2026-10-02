import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { cancelOrder, TradingError } from "@/lib/api/trading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CANCEL_ERROR_STATUS: Record<string, number> = { POSITION_NOT_FOUND: 404, NOT_CANCELLABLE: 409 };

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  const { id } = await params;
  try {
    await cancelOrder(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof TradingError) return NextResponse.json({ error: error.message, code: error.code }, { status: CANCEL_ERROR_STATUS[error.code] ?? 409 });
    throw error;
  }
}

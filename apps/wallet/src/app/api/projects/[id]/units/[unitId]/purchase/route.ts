import { NextResponse } from "next/server";
import { z } from "zod";
import { CustodyProviderError } from "@repo/providers-custody";
import { purchaseUnitTokens, PurchaseError } from "@/lib/api/invest";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { checkKycApproved, kycBlockedResponse } from "@/lib/kyc-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const purchaseSchema = z.object({ tokenAmount: z.number().int().positive() });
const PURCHASE_ERROR_STATUS: Record<string, number> = {
  UNIT_NOT_FOUND: 404, NOT_TOKENIZED: 400, NOT_AVAILABLE: 409, SOLD_OUT: 409, INSUFFICIENT_BALANCE: 409,
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string; unitId: string }> }) {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  const blocked = await checkKycApproved(user.id);
  if (blocked) return kycBlockedResponse(blocked);
  const { id, unitId } = await params;
  const parsed = purchaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid purchase request", issues: parsed.error.issues }, { status: 400 });
  }
  try {
    const transaction = await purchaseUnitTokens(user.id, { projectId: id, unitId, tokenAmount: parsed.data.tokenAmount });
    return NextResponse.json({
      transaction: {
        id: transaction.id, type: transaction.type, status: transaction.status,
        createdAt: transaction.createdAt.toISOString(),
        amount: { currencyCode: transaction.currencyCode, amount: transaction.amount },
        description: transaction.description ?? undefined, metadata: transaction.metadata ?? undefined,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof PurchaseError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: PURCHASE_ERROR_STATUS[error.code] ?? 409 });
    }
    if (error instanceof CustodyProviderError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.code === "INSUFFICIENT_BALANCE" ? 409 : 422 });
    }
    throw error;
  }
}

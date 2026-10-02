import { NextResponse } from "next/server";
import { z } from "zod";
import { createWithdrawal } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { checkKycApproved, kycBlockedResponse } from "@/lib/kyc-guard";
import { CustodyProviderError } from "@repo/providers-custody";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const withdrawSchema = z.object({
  amount: z.number().finite().positive(),
  address: z.string().trim().min(12).max(256).regex(/^[A-Za-z0-9]+$/, "Invalid wallet address"),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  const blocked = await checkKycApproved(user.id);
  if (blocked) return kycBlockedResponse(blocked);
  const parsed = withdrawSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid withdrawal request", issues: parsed.error.issues }, { status: 400 });
  try {
    return NextResponse.json({ transaction: await createWithdrawal(user.id, parsed.data) }, { status: 201 });
  } catch (error) {
    if (error instanceof CustodyProviderError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.code === "INSUFFICIENT_BALANCE" ? 409 : 422 });
    }
    throw error;
  }
}

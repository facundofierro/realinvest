import { NextResponse } from "next/server";
import { getKycApplication, submitKycApplication } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { kycSubmissionSchema } from "@/lib/kyc-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireUser())) return unauthorizedResponse();
  return NextResponse.json({ application: await getKycApplication() });
}

export async function POST(request: Request) {
  if (!(await requireUser())) return unauthorizedResponse();
  const parsed = kycSubmissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission", issues: parsed.error.issues }, { status: 400 });
  }
  return NextResponse.json({ application: await submitKycApplication(parsed.data) });
}

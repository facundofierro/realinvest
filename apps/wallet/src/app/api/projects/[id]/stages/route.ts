import { NextResponse } from "next/server";
import { getProjectStages } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireUser())) return unauthorizedResponse();
  const { id } = await params;
  const stages = await getProjectStages(id);
  return NextResponse.json({ stages });
}

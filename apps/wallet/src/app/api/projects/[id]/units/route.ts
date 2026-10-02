import { NextResponse } from "next/server";
import { getProjectUnits } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { syncPendingCustodyState } from "@/lib/api/custody-wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  await syncPendingCustodyState(user.id);
  const { id: projectId } = await params;
  const projectUnits = await getProjectUnits(projectId);

  return NextResponse.json({ units: projectUnits });
}

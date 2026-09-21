import { NextResponse } from "next/server";
import { getProjectUnits } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireUser())) return unauthorizedResponse();
  const { id: projectId } = await params;
  const projectUnits = await getProjectUnits(projectId);

  return NextResponse.json({ units: projectUnits });
}

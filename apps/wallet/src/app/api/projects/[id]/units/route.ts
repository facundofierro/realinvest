import { NextResponse } from "next/server";
import { getProjectUnits } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const projectUnits = await getProjectUnits(projectId);

  return NextResponse.json({ units: projectUnits });
}


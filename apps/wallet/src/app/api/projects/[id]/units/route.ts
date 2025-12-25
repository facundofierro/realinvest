import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type { ProjectUnit } from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const units = await readSampleJson<ProjectUnit[]>("projectUnits.json");
  const projectUnits = units.filter((u) => u.projectId === projectId);

  return NextResponse.json({ units: projectUnits });
}


import { NextResponse } from "next/server";
import { getProjectStages } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // In a real app, we'd filter by id
  const stages = await getProjectStages();
  return NextResponse.json({ stages });
}

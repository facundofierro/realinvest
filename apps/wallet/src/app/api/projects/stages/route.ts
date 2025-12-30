import { NextResponse } from "next/server";
import { getProjectStages } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const stages = await getProjectStages();
  return NextResponse.json({ stages });
}


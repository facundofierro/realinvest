import { NextResponse } from "next/server";
import { getProjectStories } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const stories = await getProjectStories();
  return NextResponse.json({ stories });
}


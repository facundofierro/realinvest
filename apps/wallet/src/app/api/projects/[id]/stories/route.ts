import { NextResponse } from "next/server";
import { getProjectStories } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // In a real app, we'd filter by id
  const stories = await getProjectStories();
  return NextResponse.json({ stories });
}

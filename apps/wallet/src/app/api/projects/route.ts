import { NextResponse } from "next/server";
import { getProjects } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ projects });
}


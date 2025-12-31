import { NextResponse } from "next/server";
import { getDashboardProjects } from "@/lib/api/dashboard-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await getDashboardProjects();
  return NextResponse.json({ projects });
}

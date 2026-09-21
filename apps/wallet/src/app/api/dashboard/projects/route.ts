import { NextResponse } from "next/server";
import { getDashboardProjects } from "@/lib/api/dashboard-projects";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireUser())) return unauthorizedResponse();
  const projects = await getDashboardProjects();
  return NextResponse.json({ projects });
}

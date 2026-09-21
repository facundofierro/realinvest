import { NextResponse } from "next/server";
import { getProjects } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireUser())) return unauthorizedResponse();
  const projects = await getProjects();
  return NextResponse.json({ projects });
}

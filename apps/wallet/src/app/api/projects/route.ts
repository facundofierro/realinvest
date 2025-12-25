import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type { Project } from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await readSampleJson<Project[]>("projects.json");
  return NextResponse.json({ projects });
}


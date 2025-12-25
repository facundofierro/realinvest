import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type { Project } from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projects = await readSampleJson<Project[]>("projects.json");
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}


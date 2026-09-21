import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireUser())) return unauthorizedResponse();
  const { id } = await params;

  try {
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

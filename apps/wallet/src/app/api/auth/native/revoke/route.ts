import { revokeRefreshToken } from "@/lib/native-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { refreshToken?: unknown } | null;
  if (typeof body?.refreshToken === "string") await revokeRefreshToken(body.refreshToken);
  return new NextResponse(null, { status: 204 });
}

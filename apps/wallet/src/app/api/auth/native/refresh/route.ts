import { rotateRefreshToken, signAccessToken } from "@/lib/native-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { refreshToken?: unknown } | null;
  if (typeof body?.refreshToken !== "string") return NextResponse.json({ error: "Invalid refresh token" }, { status: 400 });
  const result = await rotateRefreshToken(body.refreshToken);
  if (!result) return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  return NextResponse.json({ accessToken: await signAccessToken(result.user), refreshToken: result.refreshToken, user: result.user });
}

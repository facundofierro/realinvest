import { and, eq, gt, isNull } from "drizzle-orm";
import { nativeAuthCodes } from "@repo/db";
import { getDb } from "@/lib/db";
import { getNativeUser, issueRefreshToken, signAccessToken } from "@/lib/native-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { code?: unknown; state?: unknown } | null;
  if (typeof body?.code !== "string" || typeof body.state !== "string") return NextResponse.json({ error: "Invalid exchange" }, { status: 400 });
  const [code] = await getDb().select().from(nativeAuthCodes).where(eq(nativeAuthCodes.code, body.code));
  if (!code || code.consumedAt || code.expires <= new Date()) return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  const result = await getDb().update(nativeAuthCodes).set({ consumedAt: new Date() })
    .where(and(eq(nativeAuthCodes.code, body.code), isNull(nativeAuthCodes.consumedAt), gt(nativeAuthCodes.expires, new Date())));
  if (result.rowsAffected !== 1) return NextResponse.json({ error: "Code already consumed" }, { status: 401 });
  const user = await getNativeUser(code.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });
  return NextResponse.json({ accessToken: await signAccessToken(user), refreshToken: await issueRefreshToken(user.id), user });
}

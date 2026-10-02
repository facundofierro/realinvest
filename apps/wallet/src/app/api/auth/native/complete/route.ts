import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { isAllowedNativeRedirectUri } from "@/lib/native-auth";
import { nativeAuthCodes } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirectUri = requestUrl.searchParams.get("redirect_uri");
  const state = requestUrl.searchParams.get("state");
  if (!isAllowedNativeRedirectUri(redirectUri) || !state) return NextResponse.json({ error: "Invalid native redirect" }, { status: 400 });
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", requestUrl));

  const code = crypto.randomUUID();
  await getDb().insert(nativeAuthCodes).values({
    code, userId: session.user.id, redirectUri, expires: new Date(Date.now() + 2 * 60 * 1000),
  });
  const callback = new URL(redirectUri);
  callback.searchParams.set("code", code);
  callback.searchParams.set("state", state);
  return NextResponse.redirect(callback);
}

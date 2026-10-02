import { signIn } from "@/auth";
import { isAllowedNativeRedirectUri } from "@/lib/native-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUri = url.searchParams.get("redirect_uri");
  const state = url.searchParams.get("state");
  if (!isAllowedNativeRedirectUri(redirectUri) || !state) {
    return NextResponse.json({ error: "Invalid native redirect" }, { status: 400 });
  }
  const complete = new URL("/api/auth/native/complete", url.origin);
  complete.searchParams.set("redirect_uri", redirectUri);
  complete.searchParams.set("state", state);
  return signIn("google", { redirectTo: complete.toString() });
}

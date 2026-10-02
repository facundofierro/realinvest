import { SignJWT, jwtVerify } from "jose";
import { and, eq, gt, isNull } from "drizzle-orm";
import { nativeRefreshTokens, users, type KycStatus } from "@repo/db";
import { getDb } from "@/lib/db";

export const NATIVE_REDIRECT_URI = "realinvestwallet://auth-callback";
export const ALLOWED_NATIVE_REDIRECT_URIS = [NATIVE_REDIRECT_URI] as const;
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type NativeUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  kycStatus: KycStatus;
};

function signingKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for native authentication");
  return new TextEncoder().encode(secret);
}

export function isAllowedNativeRedirectUri(value: string | null): value is typeof NATIVE_REDIRECT_URI {
  return value === NATIVE_REDIRECT_URI;
}

export async function signAccessToken(user: Pick<NativeUser, "id" | "kycStatus">) {
  return new SignJWT({ kycStatus: user.kycStatus })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(signingKey());
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ["HS256"] });
    if (!payload.sub || !isKycStatus(payload.kycStatus)) return null;
    return { id: payload.sub, kycStatus: payload.kycStatus };
  } catch {
    return null;
  }
}

function isKycStatus(value: unknown): value is KycStatus {
  return value === "none" || value === "pending" || value === "approved" || value === "rejected";
}

export async function getNativeUser(userId: string): Promise<NativeUser | null> {
  const [user] = await getDb().select({
    id: users.id, name: users.name, email: users.email, image: users.image, kycStatus: users.kycStatus,
  }).from(users).where(eq(users.id, userId));
  return user ?? null;
}

export async function issueRefreshToken(userId: string, rotatedFromId?: string) {
  const id = crypto.randomUUID();
  await getDb().insert(nativeRefreshTokens).values({
    id, userId, rotatedFromId, expires: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });
  return id;
}

export async function rotateRefreshToken(presentedId: string) {
  const [token] = await getDb().select().from(nativeRefreshTokens)
    .where(eq(nativeRefreshTokens.id, presentedId));
  if (!token || token.expires <= new Date()) return null;

  if (token.consumedAt) {
    // A rotated token was replayed. Revoke this user's still-active native credentials.
    await getDb().update(nativeRefreshTokens).set({ consumedAt: new Date() })
      .where(and(eq(nativeRefreshTokens.userId, token.userId), isNull(nativeRefreshTokens.consumedAt)));
    return null;
  }

  await getDb().update(nativeRefreshTokens).set({ consumedAt: new Date() })
    .where(and(eq(nativeRefreshTokens.id, presentedId), isNull(nativeRefreshTokens.consumedAt), gt(nativeRefreshTokens.expires, new Date())));
  const user = await getNativeUser(token.userId);
  if (!user) return null;
  return { refreshToken: await issueRefreshToken(token.userId, presentedId), user };
}

export async function revokeRefreshToken(presentedId: string) {
  await getDb().update(nativeRefreshTokens).set({ consumedAt: new Date() })
    .where(and(eq(nativeRefreshTokens.id, presentedId), isNull(nativeRefreshTokens.consumedAt)));
}

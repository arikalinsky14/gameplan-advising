import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma, isDbConfigured } from "./db";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ??
    "dev-only-do-not-ship-this-secret-set-AUTH_SECRET-in-vercel-env"
);
const COOKIE_NAME = "gpa_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = {
  userId: string;
  role: "ADVISOR" | "CLIENT" | "GUARDIAN";
};

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 11);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (
      typeof payload.userId === "string" &&
      (payload.role === "ADVISOR" || payload.role === "CLIENT" || payload.role === "GUARDIAN")
    ) {
      return { userId: payload.userId, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const s = await getSession();
  if (!s || !isDbConfigured()) return null;
  try {
    return await prisma.user.findUnique({
      where: { id: s.userId },
      include: { athlete: true },
    });
  } catch {
    return null;
  }
}

export async function requireAdvisor() {
  const s = await getSession();
  if (!s || s.role !== "ADVISOR") throw new Error("Advisor session required");
  return s;
}

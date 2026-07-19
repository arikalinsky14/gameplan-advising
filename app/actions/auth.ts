"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  clearSessionCookie,
  createSessionCookie,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signup(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "CLIENT");
  const displayName = String(formData.get("displayName") ?? "").trim() || null;

  if (!email || !password) return { ok: false, error: "Email and password required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (role !== "CLIENT" && role !== "ADVISOR")
    return { ok: false, error: "Invalid role." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with that email already exists." };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      displayName,
      ...(role === "CLIENT"
        ? {
            athlete: {
              create: {
                firstName: displayName?.split(" ")[0] ?? "",
                lastName: displayName?.split(" ").slice(1).join(" ") ?? "",
              },
            },
          }
        : {}),
    },
  });

  await createSessionCookie({ userId: user.id, role: user.role });
  return { ok: true };
}

export async function login(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Email and password required." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "Invalid credentials." };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { ok: false, error: "Invalid credentials." };

  await createSessionCookie({ userId: user.id, role: user.role });
  return { ok: true };
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}

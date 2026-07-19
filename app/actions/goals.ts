"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function athleteForSession() {
  const s = await getSession();
  if (!s) return null;
  if (s.role === "CLIENT") {
    const u = await prisma.user.findUnique({
      where: { id: s.userId },
      include: { athlete: true },
    });
    return u?.athlete ?? null;
  }
  return null;
}

export async function listGoals(athleteId?: string) {
  const s = await getSession();
  if (!s) return [];
  if (s.role === "ADVISOR" && athleteId) {
    return prisma.goal.findMany({
      where: { athleteId },
      orderBy: { createdAt: "asc" },
    });
  }
  const a = await athleteForSession();
  if (!a) return [];
  return prisma.goal.findMany({
    where: { athleteId: a.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function addGoal(bucket: "SHORT" | "MEDIUM" | "LONG", athleteIdOverride?: string) {
  const s = await getSession();
  if (!s) return { ok: false as const, error: "Not signed in" };

  const athleteId = s.role === "ADVISOR" ? athleteIdOverride : (await athleteForSession())?.id;
  if (!athleteId) return { ok: false as const, error: "No athlete on account" };

  const g = await prisma.goal.create({
    data: { athleteId, bucket, text: "", years: "" },
  });
  revalidatePath("/intake/goals");
  return { ok: true as const, goal: g };
}

export async function updateGoal(
  id: string,
  patch: { text?: string; years?: string; amount?: number | null },
) {
  const s = await getSession();
  if (!s) return { ok: false as const, error: "Not signed in" };

  const goal = await prisma.goal.findUnique({ where: { id }, include: { athlete: true } });
  if (!goal) return { ok: false as const, error: "Not found" };
  if (s.role === "CLIENT" && goal.athlete.ownerId !== s.userId)
    return { ok: false as const, error: "Not yours" };

  await prisma.goal.update({
    where: { id },
    data: {
      ...(patch.text !== undefined ? { text: patch.text } : {}),
      ...(patch.years !== undefined ? { years: patch.years } : {}),
      ...(patch.amount !== undefined ? { amount: patch.amount } : {}),
    },
  });
  revalidatePath("/intake/goals");
  return { ok: true as const };
}

export async function deleteGoal(id: string) {
  const s = await getSession();
  if (!s) return { ok: false as const, error: "Not signed in" };
  const goal = await prisma.goal.findUnique({ where: { id }, include: { athlete: true } });
  if (!goal) return { ok: false as const, error: "Not found" };
  if (s.role === "CLIENT" && goal.athlete.ownerId !== s.userId)
    return { ok: false as const, error: "Not yours" };

  await prisma.goal.delete({ where: { id } });
  revalidatePath("/intake/goals");
  return { ok: true as const };
}

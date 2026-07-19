"use server";

import { revalidatePath } from "next/cache";
import { prisma, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { EXPENSE_LINE_BY_SLUG } from "@/content/expense-lines";

const NO_DB = { ok: false as const, error: "Database not configured" };

async function athleteIdForCurrent(): Promise<string | null> {
  const s = await getSession();
  if (!s) return null;
  if (s.role === "CLIENT") {
    try {
      const u = await prisma.user.findUnique({
        where: { id: s.userId },
        include: { athlete: true },
      });
      return u?.athlete?.id ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function listExpenses(athleteIdOverride?: string) {
  if (!isDbConfigured()) return [];
  const s = await getSession();
  if (!s) return [];
  try {
    const athleteId =
      s.role === "ADVISOR" ? athleteIdOverride : await athleteIdForCurrent();
    if (!athleteId) return [];
    return await prisma.expense.findMany({
      where: { athleteId },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [];
  }
}

// Upsert by (athlete, category). One row per line item.
export async function saveExpenseLine(
  slug: string,
  amount: number,
  athleteIdOverride?: string,
) {
  if (!isDbConfigured()) return NO_DB;
  const s = await getSession();
  if (!s) return { ok: false as const, error: "Not signed in" };
  const line = EXPENSE_LINE_BY_SLUG[slug];
  if (!line) return { ok: false as const, error: "Unknown expense category" };

  const athleteId =
    s.role === "ADVISOR" ? athleteIdOverride : await athleteIdForCurrent();
  if (!athleteId) return { ok: false as const, error: "No athlete on account" };

  try {
    const existing = await prisma.expense.findFirst({
      where: { athleteId, category: slug },
    });
    if (existing) {
      await prisma.expense.update({
        where: { id: existing.id },
        data: { amount, athleteSpecific: line.athleteSpecific, deductible: line.deductible },
      });
    } else {
      await prisma.expense.create({
        data: {
          athleteId,
          category: slug,
          amount,
          athleteSpecific: line.athleteSpecific,
          deductible: line.deductible,
        },
      });
    }
    revalidatePath("/intake/expenses");
    return { ok: true as const };
  } catch (e) {
    console.error("saveExpenseLine error", e);
    return { ok: false as const, error: "Could not save" };
  }
}

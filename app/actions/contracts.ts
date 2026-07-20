"use server";

import { revalidatePath } from "next/cache";
import { prisma, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/auth";

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

export async function listContracts(athleteIdOverride?: string) {
  if (!isDbConfigured()) return [];
  const s = await getSession();
  if (!s) return [];
  try {
    const athleteId =
      s.role === "ADVISOR" ? athleteIdOverride : await athleteIdForCurrent();
    if (!athleteId) return [];
    return await prisma.contract.findMany({
      where: { athleteId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function createContract(
  input: {
    brand: string;
    grossAmount: number;
    agentFeePct: number;
    nonCashFmv: number;
    paymentSchedule?: string | null;
    termStart?: string | null;
    termEnd?: string | null;
    exclusivity?: string | null;
    deliverables?: string | null;
  },
  athleteIdOverride?: string,
) {
  if (!isDbConfigured()) return NO_DB;
  const s = await getSession();
  if (!s) return { ok: false as const, error: "Not signed in" };

  const athleteId =
    s.role === "ADVISOR" ? athleteIdOverride : await athleteIdForCurrent();
  if (!athleteId) return { ok: false as const, error: "No athlete on account" };

  try {
    const created = await prisma.contract.create({
      data: {
        athleteId,
        brand: input.brand.trim() || "Untitled deal",
        grossAmount: input.grossAmount,
        agentFeePct: input.agentFeePct,
        nonCashFmv: input.nonCashFmv,
        paymentSchedule: input.paymentSchedule || null,
        termStart: input.termStart ? new Date(input.termStart) : null,
        termEnd: input.termEnd ? new Date(input.termEnd) : null,
        exclusivity: input.exclusivity || null,
        deliverables: input.deliverables || null,
      },
    });
    revalidatePath("/intake/contracts");
    return { ok: true as const, contract: created };
  } catch (e) {
    console.error("createContract error", e);
    return { ok: false as const, error: "Could not save contract" };
  }
}

export async function deleteContract(id: string) {
  if (!isDbConfigured()) return NO_DB;
  const s = await getSession();
  if (!s) return { ok: false as const, error: "Not signed in" };
  try {
    const c = await prisma.contract.findUnique({
      where: { id },
      include: { athlete: true },
    });
    if (!c) return { ok: false as const, error: "Not found" };
    if (s.role === "CLIENT" && c.athlete.ownerId !== s.userId)
      return { ok: false as const, error: "Not yours" };
    await prisma.contract.delete({ where: { id } });
    revalidatePath("/intake/contracts");
    return { ok: true as const };
  } catch (e) {
    console.error("deleteContract error", e);
    return { ok: false as const, error: "Could not delete" };
  }
}

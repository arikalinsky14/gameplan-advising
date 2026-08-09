"use server";

import { revalidatePath } from "next/cache";
import { prisma, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/auth";

const NO_DB = { ok: false as const, error: "Database not configured" };

async function assertContractAccess(contractId: string) {
  const s = await getSession();
  if (!s) return { ok: false as const, error: "Not signed in" };
  const c = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { athlete: true },
  });
  if (!c) return { ok: false as const, error: "Contract not found" };
  if (s.role === "CLIENT" && c.athlete.ownerId !== s.userId)
    return { ok: false as const, error: "Not yours" };
  return { ok: true as const, contract: c };
}

export async function addWorkLogEntry(input: {
  contractId: string;
  date: string;
  state: string;
  city?: string | null;
  hours: number;
  note?: string | null;
  proofUrl?: string | null;
  proofName?: string | null;
}) {
  if (!isDbConfigured()) return NO_DB;
  const guard = await assertContractAccess(input.contractId);
  if (!guard.ok) return guard;

  try {
    const created = await prisma.workLogEntry.create({
      data: {
        contractId: input.contractId,
        date: new Date(input.date),
        state: input.state.toUpperCase(),
        city: input.city?.trim() || null,
        hours: Number.isFinite(input.hours) && input.hours > 0 ? input.hours : 1,
        note: input.note ?? null,
        proofUrl: input.proofUrl ?? null,
        proofName: input.proofName ?? null,
      },
    });
    revalidatePath("/intake/contracts");
    return { ok: true as const, entry: created };
  } catch (e) {
    console.error("addWorkLogEntry error", e);
    return { ok: false as const, error: "Could not save work log entry" };
  }
}

export async function deleteWorkLogEntry(id: string) {
  if (!isDbConfigured()) return NO_DB;
  const s = await getSession();
  if (!s) return { ok: false as const, error: "Not signed in" };
  try {
    const entry = await prisma.workLogEntry.findUnique({
      where: { id },
      include: { contract: { include: { athlete: true } } },
    });
    if (!entry) return { ok: false as const, error: "Not found" };
    if (s.role === "CLIENT" && entry.contract.athlete.ownerId !== s.userId)
      return { ok: false as const, error: "Not yours" };
    await prisma.workLogEntry.delete({ where: { id } });
    revalidatePath("/intake/contracts");
    return { ok: true as const };
  } catch (e) {
    console.error("deleteWorkLogEntry error", e);
    return { ok: false as const, error: "Could not delete" };
  }
}

export async function updateContractWorkState(input: {
  contractId: string;
  workState: string | null;
  workStateConfirmed: boolean;
}) {
  if (!isDbConfigured()) return NO_DB;
  const guard = await assertContractAccess(input.contractId);
  if (!guard.ok) return guard;

  try {
    await prisma.contract.update({
      where: { id: input.contractId },
      data: {
        workState: input.workState ? input.workState.toUpperCase() : null,
        workStateConfirmed: input.workStateConfirmed,
      },
    });
    revalidatePath("/intake/contracts");
    return { ok: true as const };
  } catch (e) {
    console.error("updateContractWorkState error", e);
    return { ok: false as const, error: "Could not save" };
  }
}

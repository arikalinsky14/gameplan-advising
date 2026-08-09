"use server";

import { revalidatePath } from "next/cache";
import { prisma, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/auth";

const NO_DB = { ok: false as const, error: "Database not configured" };

async function ownAthlete() {
  const s = await getSession();
  if (!s) return null;
  if (s.role !== "CLIENT") return null;
  try {
    const u = await prisma.user.findUnique({
      where: { id: s.userId },
      include: { athlete: true },
    });
    return u?.athlete ?? null;
  } catch {
    return null;
  }
}

function isMinorFromDob(dob: string | null): boolean {
  if (!dob) return false;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  const age =
    today.getFullYear() - d.getFullYear() -
    (today.getMonth() < d.getMonth() ||
      (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())
      ? 1 : 0);
  return age < 18;
}

export async function saveIntakeBasics(input: {
  firstName: string;
  lastName: string;
  dob: string;
  homeState: string;
}) {
  if (!isDbConfigured()) return NO_DB;
  const athlete = await ownAthlete();
  if (!athlete) return { ok: false as const, error: "No athlete on account" };

  try {
    await prisma.athlete.update({
      where: { id: athlete.id },
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        dob: input.dob ? new Date(input.dob) : null,
        homeState: input.homeState.trim().toUpperCase() || null,
        isMinor: isMinorFromDob(input.dob),
      },
    });
    revalidatePath("/intake");
    return { ok: true as const };
  } catch (e) {
    console.error("saveIntakeBasics", e);
    return { ok: false as const, error: "Could not save" };
  }
}

export async function saveIntakeSport(input: {
  sport: string;
  sportTier: 1 | 2;
}) {
  if (!isDbConfigured()) return NO_DB;
  const athlete = await ownAthlete();
  if (!athlete) return { ok: false as const, error: "No athlete on account" };
  try {
    await prisma.athlete.update({
      where: { id: athlete.id },
      data: {
        sport: input.sport,
        sportTier: input.sportTier,
        // Clear team fields when the sport changes so a mismatched team can't
        // hang around from a previous selection.
        ...(input.sport !== athlete.sport
          ? { teamId: null, teamSchool: null, teamManualNote: null }
          : {}),
      },
    });
    revalidatePath("/intake");
    return { ok: true as const };
  } catch (e) {
    console.error("saveIntakeSport", e);
    return { ok: false as const, error: "Could not save" };
  }
}

export async function saveIntakeTeam(input: {
  teamId: string;
  teamSchool: string;
  manualNote?: string | null;
}) {
  if (!isDbConfigured()) return NO_DB;
  const athlete = await ownAthlete();
  if (!athlete) return { ok: false as const, error: "No athlete on account" };
  try {
    await prisma.athlete.update({
      where: { id: athlete.id },
      data: {
        teamId: input.teamId,
        teamSchool: input.teamSchool,
        teamManualNote: input.manualNote ?? null,
        status: "IN_PROGRESS",
      },
    });
    revalidatePath("/intake");
    return { ok: true as const };
  } catch (e) {
    console.error("saveIntakeTeam", e);
    return { ok: false as const, error: "Could not save" };
  }
}

export async function resetIntake() {
  if (!isDbConfigured()) return NO_DB;
  const athlete = await ownAthlete();
  if (!athlete) return { ok: false as const, error: "No athlete on account" };
  try {
    await prisma.athlete.update({
      where: { id: athlete.id },
      data: {
        // Keep the athlete row itself and their name (they signed up with it)
        // but reset the intake decisions.
        dob: null,
        homeState: null,
        isMinor: false,
        sport: null,
        sportTier: null,
        teamId: null,
        teamSchool: null,
        teamManualNote: null,
        status: "NOT_STARTED",
      },
    });
    revalidatePath("/intake");
    return { ok: true as const };
  } catch (e) {
    console.error("resetIntake", e);
    return { ok: false as const, error: "Could not reset" };
  }
}

import { getSession } from "@/lib/auth";
import { prisma, isDbConfigured } from "@/lib/db";
import { fetchTeamSchedule } from "@/lib/schedule";
import JockTaxClient, { type ScheduleGameLite } from "./JockTaxClient";

async function currentAthlete() {
  if (!isDbConfigured()) return null;
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

export default async function JockTaxPage() {
  const s = await getSession();
  const athlete = await currentAthlete();

  let scheduleGames: ScheduleGameLite[] = [];
  let scheduleStatus: "ok" | "no-key" | "not-supported" | "error" | "not-signed-in" =
    "not-signed-in";
  let scheduleSource = "—";

  if (!s) {
    scheduleStatus = "not-signed-in";
  } else if (athlete?.sport && athlete?.teamSchool) {
    const res = await fetchTeamSchedule(athlete.sport, athlete.teamSchool);
    scheduleStatus = res.status === "ok" ? "ok" : res.status;
    scheduleGames = res.status === "ok" ? res.games : [];
    scheduleSource = "source" in res ? res.source : "—";
  } else if (athlete) {
    scheduleStatus = "not-supported";
  }

  return (
    <JockTaxClient
      homeStateInit={athlete?.homeState ?? "AL"}
      teamSchool={athlete?.teamSchool ?? null}
      scheduleGames={scheduleGames}
      scheduleStatus={scheduleStatus}
      scheduleSource={scheduleSource}
    />
  );
}

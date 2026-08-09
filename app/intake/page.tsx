import { getSession } from "@/lib/auth";
import { prisma, isDbConfigured } from "@/lib/db";
import { TEAMS, TIER1_SPORTS, type Sport, type Team } from "@/content/teams";
import IntakeFlow, { type IntakeInitial } from "./IntakeFlow";

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

// A manual-entry stand-in team so the flow keeps working when the athlete
// picked "enter manually" but the resulting id isn't in TEAMS.
function reconstructManualTeam(school: string, homeState: string | null): Team {
  return {
    id: "manual",
    school,
    mascot: "—",
    city: "—",
    state: homeState ?? "",
    conference: "Other",
    division: "D1",
    primary: "#8C7758",
    accent: "#1D2532",
    serif: true,
    sports: ["football-m", "basketball-m", "basketball-w"],
  };
}

export default async function IntakePage() {
  const athlete = await currentAthlete();

  const initial: IntakeInitial = athlete
    ? {
        basics: {
          firstName: athlete.firstName ?? "",
          lastName: athlete.lastName ?? "",
          dob: athlete.dob ? athlete.dob.toISOString().slice(0, 10) : "",
          state: athlete.homeState ?? "",
        },
        sport: athlete.sport ?? null,
        sportId: sportIdFrom(athlete.sport),
        team: athlete.teamId
          ? TEAMS.find((t) => t.id === athlete.teamId) ??
            reconstructManualTeam(athlete.teamSchool ?? "", athlete.homeState)
          : null,
        hasSignedIn: true,
      }
    : {
        basics: { firstName: "", lastName: "", dob: "", state: "" },
        sport: null,
        sportId: null,
        team: null,
        hasSignedIn: false,
      };

  return <IntakeFlow initial={initial} />;
}

function sportIdFrom(sport: string | null | undefined): Sport | null {
  if (!sport) return null;
  return TIER1_SPORTS.find((s) => s.label === sport)?.id ?? null;
}

// Schedule lookup for a team.
//
// FINDINGS FROM PRIOR RESEARCH (see docs/PHASE-1-HANDOFF.md § D1):
// There is no clean one-size-fits-all sports schedule API for our sports —
// but the same maintainer publishes CollegeFootballData (CFBD) and
// CollegeBasketballData (CBD) on ONE Patreon Tier 3 subscription ($10/mo,
// 75k monthly calls, GraphQL + realtime). Both expose date, home/away,
// opponent, and venue city/state — everything we need to drive the jock-tax
// duty-day calc. Women's D1 basketball is genuinely underserved commercially;
// verify CBD's WBB coverage before committing, and keep ESPN's undocumented
// scoreboard endpoint warm as a bus-factor fallback.
//
// PHASE-1 SCOPE: this file wires MEN'S BASKETBALL via the CBD API. Football
// and women's basketball drop in the same way once we have keys.
//
// This module is server-side only (imports process.env). Do not import from
// client components.

export type ScheduleGame = {
  date: string;      // ISO date
  opponent: string;
  home: boolean;
  city: string | null;
  state: string | null;
  neutralSite: boolean;
};

export type ScheduleResult =
  | { status: "ok"; games: ScheduleGame[]; source: string }
  | { status: "no-key"; games: []; source: string }
  | { status: "not-supported"; games: []; sport: string }
  | { status: "error"; games: []; source: string; error: string };

const CBD_BASE = "https://api.collegebasketballdata.com";

const SEASON = () => new Date().getFullYear(); // CBD uses the year the season ends

// The CBD API takes a `team` param that expects the team's canonical name.
// Our TEAM.id is short; we key off TEAM.school which is the official name.
export async function fetchMensBasketballSchedule(schoolOfficialName: string): Promise<ScheduleResult> {
  const key = process.env.CBD_API_KEY;
  if (!key) {
    return { status: "no-key", games: [], source: "collegebasketballdata.com" };
  }

  const url = new URL(CBD_BASE + "/games");
  url.searchParams.set("season", String(SEASON()));
  url.searchParams.set("team", schoolOfficialName);

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      next: { revalidate: 60 * 60 * 6 }, // 6-hour cache
    });
    if (!res.ok) {
      return { status: "error", games: [], source: url.toString(), error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as CBDGame[];
    const games = data
      .map((g) => normalizeCbdGame(g, schoolOfficialName))
      .filter((g): g is ScheduleGame => g !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
    return { status: "ok", games, source: "collegebasketballdata.com" };
  } catch (e) {
    return {
      status: "error",
      games: [],
      source: "collegebasketballdata.com",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// Router — one entry point per sport. Everything but men's basketball is
// stubbed until we wire it.
export async function fetchTeamSchedule(
  sport: string,
  schoolOfficialName: string,
): Promise<ScheduleResult> {
  if (sport === "Men's Basketball") return fetchMensBasketballSchedule(schoolOfficialName);
  return { status: "not-supported", games: [], sport };
}

// CBD /games response shape (subset we use).
type CBDGame = {
  id: number;
  startDate?: string;
  startDateTime?: string;
  homeTeam?: string;
  awayTeam?: string;
  neutralSite?: boolean;
  venue?: {
    name?: string;
    city?: string;
    state?: string;
  } | null;
};

function normalizeCbdGame(g: CBDGame, us: string): ScheduleGame | null {
  const date = (g.startDate ?? g.startDateTime ?? "").slice(0, 10);
  if (!date) return null;
  const isHome = (g.homeTeam ?? "").toLowerCase().includes(us.toLowerCase());
  const opponent = isHome ? (g.awayTeam ?? "") : (g.homeTeam ?? "");
  return {
    date,
    opponent: opponent || "TBD",
    home: !!isHome,
    city: g.venue?.city ?? null,
    state: g.venue?.state ?? null,
    neutralSite: !!g.neutralSite,
  };
}

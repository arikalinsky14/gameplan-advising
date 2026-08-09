// Schedule lookup for a team.
//
// Wired to CollegeFootballData (CFBD) — a free tier is available with an
// API key from https://collegefootballdata.com (Patreon supporters get
// higher rate limits and realtime, but the free tier is sufficient for
// per-team seasonal schedule fetches on a modest advisor caseload).
//
// This module is server-side only. Do not import from client components.

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

const CFBD_BASE = "https://api.collegefootballdata.com";

const SEASON = () => {
  // College football season spans one calendar year; the CFBD `year` param
  // is the year the season started. During Jan–Jul we still want the prior
  // year's schedule until the new season is populated.
  const now = new Date();
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
};

export async function fetchFootballSchedule(schoolOfficialName: string): Promise<ScheduleResult> {
  const key = process.env.CFBD_API_KEY;
  if (!key) {
    return { status: "no-key", games: [], source: "collegefootballdata.com" };
  }

  const url = new URL(CFBD_BASE + "/games");
  url.searchParams.set("year", String(SEASON()));
  // CFBD accepts the school's canonical name (e.g. "Alabama", "Ohio State").
  // Our TEAM.school is a longer form ("University of Alabama"); the API is
  // fairly tolerant but the short name is safest.
  url.searchParams.set("team", cfbdTeamName(schoolOfficialName));

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      next: { revalidate: 60 * 60 * 6 }, // 6-hour cache
    });
    if (!res.ok) {
      return { status: "error", games: [], source: url.toString(), error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as CFBDGame[];
    const games = data
      .map((g) => normalizeCfbdGame(g, cfbdTeamName(schoolOfficialName)))
      .filter((g): g is ScheduleGame => g !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
    return { status: "ok", games, source: "collegefootballdata.com" };
  } catch (e) {
    return {
      status: "error",
      games: [],
      source: "collegefootballdata.com",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// Router — one entry point per sport. Football wired via CFBD; other sports
// stubbed pending vendor decisions in the handoff doc.
export async function fetchTeamSchedule(
  sport: string,
  schoolOfficialName: string,
): Promise<ScheduleResult> {
  if (sport === "Men's Football") return fetchFootballSchedule(schoolOfficialName);
  return { status: "not-supported", games: [], sport };
}

// CFBD /games response shape (subset we use).
type CFBDGame = {
  id: number;
  season?: number;
  startDate?: string;
  start_date?: string;
  homeTeam?: string;
  home_team?: string;
  awayTeam?: string;
  away_team?: string;
  neutralSite?: boolean;
  neutral_site?: boolean;
  venue?: string;
  venueId?: number;
  homeCity?: string;
  home_city?: string;
  homeState?: string;
  home_state?: string;
  awayCity?: string;
  away_city?: string;
  awayState?: string;
  away_state?: string;
};

function normalizeCfbdGame(g: CFBDGame, us: string): ScheduleGame | null {
  const start = g.startDate ?? g.start_date ?? "";
  const date = start.slice(0, 10);
  if (!date) return null;
  const home = g.homeTeam ?? g.home_team ?? "";
  const away = g.awayTeam ?? g.away_team ?? "";
  const isHome = home.toLowerCase().includes(us.toLowerCase());
  const opponent = isHome ? away : home;
  const neutral = !!(g.neutralSite ?? g.neutral_site);
  const city = isHome ? (g.homeCity ?? g.home_city ?? null) : (g.awayCity ?? g.away_city ?? null);
  const state = isHome ? (g.homeState ?? g.home_state ?? null) : (g.awayState ?? g.away_state ?? null);
  return {
    date,
    opponent: opponent || "TBD",
    home: !!isHome,
    city,
    state,
    neutralSite: neutral,
  };
}

// Trim our long school names to CFBD's short form. Best-effort — the API is
// fairly forgiving on nickname/mascot suffixes.
function cfbdTeamName(school: string): string {
  return school
    .replace(/^University of\s+/i, "")
    .replace(/^The\s+/i, "")
    .replace(/\s+University$/i, "")
    .replace(/,\s*(Berkeley|Los Angeles|San Diego|Amherst)$/i, "")
    .trim();
}

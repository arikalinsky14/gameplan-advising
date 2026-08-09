"use client";
// SCOPE — READ BEFORE CHANGING:
// The duty-day math here is legally the WRONG tool for NIL income. NIL
// contracts pay for name/image/likeness work and are sourced to where the
// work was performed (see /intake/contracts + /tools/consolidated-tax).
// This tool is retained for House-settlement REVENUE-SHARE income, which
// (unlike NIL) is compensation tied to being on the roster and traveling
// with the team. Its input is `revenueShareIncome` only; do NOT re-point
// it at NIL income.
//
// See docs/TAX-CALCULATOR-ACCURACY-GUIDE.md §6.

import { useMemo, useState } from "react";
import { STATE_TAX_RATES, rateFor, applyHomeStateCredit } from "@/content/tax";
import BackToHomeClient from "@/components/BackToHomeClient";

export type ScheduleGameLite = {
  date: string;
  opponent: string;
  home: boolean;
  city: string | null;
  state: string | null;
  neutralSite: boolean;
};

function daysBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

type DutyTally = { state: string; days: number; home: boolean };

// Convert a schedule into duty-day counts by state. Each game contributes
// its date + the day before + the day after; duplicates on the same
// (state, date) are collapsed.
function computeDutyDaysFromSchedule(
  games: ScheduleGameLite[],
  homeState: string,
  extraDays?: { state: string; days: number },
  preseasonStart?: string,
): { byState: Map<string, DutyTally>; seasonStart: string; seasonEnd: string } {
  const byState = new Map<string, DutyTally>();
  if (games.length === 0) {
    return {
      byState,
      seasonStart: preseasonStart || new Date().toISOString().slice(0, 10),
      seasonEnd: new Date().toISOString().slice(0, 10),
    };
  }
  const firstGame = games[0].date;
  const lastGame = games[games.length - 1].date;

  if (preseasonStart) {
    const preDays = daysBetween(preseasonStart, firstGame) - 1;
    if (preDays > 0) {
      byState.set(homeState, {
        state: homeState,
        days: (byState.get(homeState)?.days ?? 0) + preDays,
        home: true,
      });
    }
  }

  const seen = new Set<string>();
  for (const g of games) {
    const state = (g.state ?? "").toUpperCase();
    if (!state) continue;
    const gd = new Date(g.date);
    for (const offset of [-1, 0, 1]) {
      const d = new Date(gd);
      d.setDate(gd.getDate() + offset);
      const key = `${state}:${d.toISOString().slice(0, 10)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const existing = byState.get(state);
      byState.set(state, {
        state,
        days: (existing?.days ?? 0) + 1,
        home: state === homeState.toUpperCase(),
      });
    }
  }

  if (extraDays && extraDays.state && extraDays.days > 0) {
    const s = extraDays.state.toUpperCase();
    const existing = byState.get(s);
    byState.set(s, {
      state: s,
      days: (existing?.days ?? 0) + extraDays.days,
      home: s === homeState.toUpperCase(),
    });
  }

  return { byState, seasonStart: preseasonStart || firstGame, seasonEnd: lastGame };
}

export default function JockTaxClient({
  homeStateInit,
  teamSchool,
  scheduleGames,
  scheduleStatus,
  scheduleSource,
}: {
  homeStateInit: string;
  teamSchool: string | null;
  scheduleGames: ScheduleGameLite[];
  scheduleStatus: "ok" | "no-key" | "not-supported" | "error" | "not-signed-in";
  scheduleSource: string;
}) {
  const [homeState, setHomeState] = useState(homeStateInit || "AL");
  const [revenueShare, setRevenueShare] = useState(120_000);
  const [preseasonStart, setPreseasonStart] = useState("");
  const [extraState, setExtraState] = useState("");
  const [extraDays, setExtraDays] = useState(0);
  const [useRefinement, setUseRefinement] = useState(false);

  const { byState, seasonStart, seasonEnd } = useMemo(
    () =>
      computeDutyDaysFromSchedule(
        scheduleGames,
        homeState,
        useRefinement && extraState && extraDays ? { state: extraState, days: extraDays } : undefined,
        useRefinement && preseasonStart ? preseasonStart : undefined,
      ),
    [scheduleGames, homeState, useRefinement, preseasonStart, extraState, extraDays],
  );

  const seasonDays = useMemo(
    () => daysBetween(seasonStart, seasonEnd),
    [seasonStart, seasonEnd],
  );

  const rows = useMemo(() => {
    const arr = Array.from(byState.values()).map((t) => {
      const info = rateFor(t.state);
      const share = t.days / seasonDays;
      const allocated = revenueShare * share;
      const tax = allocated * info.rate;
      return {
        state: t.state,
        days: t.days,
        share,
        allocated,
        rate: info.rate,
        tax,
        home: t.home,
        nonresidentFile:
          !t.home && info.filingThreshold > 0 && allocated > info.filingThreshold,
      };
    });
    arr.sort((a, b) => b.tax - a.tax);
    return arr;
  }, [byState, seasonDays, revenueShare]);

  const homeRow = rows.find((r) => r.home);
  const awayRows = rows.filter((r) => !r.home);
  const awayTax = awayRows.reduce((s, r) => s + r.tax, 0);
  const awayAllocated = awayRows.reduce((s, r) => s + r.allocated, 0);
  const homeAllocated = homeRow?.allocated ?? 0;
  const homeGrossLiability = (homeAllocated || revenueShare) * rateFor(homeState).rate;
  const { credit, homeStateAfterCredit } = applyHomeStateCredit(homeGrossLiability, awayTax);
  const totalAfterCredit = awayTax + homeStateAfterCredit;

  const homeGames = scheduleGames.filter((g) => (g.state ?? "").toUpperCase() === homeState.toUpperCase()).length;
  const awayGames = scheduleGames.length - homeGames;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="eyebrow">Section 07 · A · Revenue-share</div>
        <h1 className="display text-4xl md:text-6xl mt-4 text-ink">
          Duty-day tax on revenue share.
        </h1>
        <p className="mt-4 text-slate max-w-2xl leading-relaxed">
          Applies House-settlement revenue-share income to each state
          the athlete competes in, using duty-day allocation over the live
          schedule.{" "}
          <strong className="text-ink">
            NIL contracts do not source through this tool
          </strong>{" "}
          — those route through Contracts &amp; Consolidated Tax by work location.
        </p>

        <div className="mt-8 rounded-sm bg-ink text-paper px-5 py-3 text-sm inline-flex items-center gap-3">
          <span className="eyebrow text-paper/70">Label</span>
          <span>Estimate for planning purposes — not a filed return.</span>
        </div>

        {/* Schedule connection status */}
        <div className="mt-8">
          {scheduleStatus === "ok" && (
            <div className="rounded-sm border border-line bg-mist/50 px-5 py-4 text-sm">
              <span className="eyebrow mr-2">Schedule</span>
              {teamSchool ?? "Team"} · {scheduleGames.length}{" "}
              game{scheduleGames.length === 1 ? "" : "s"}
              {homeGames > 0 && awayGames > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className="tabular-nums">
                    {homeGames} home / {awayGames} away
                  </span>
                </>
              )}{" "}
              · source: <code className="text-[11px] bg-paper px-1 rounded-sm">{scheduleSource}</code>
            </div>
          )}
          {scheduleStatus === "no-key" && (
            <div className="rounded-sm border-l-2 border-accent bg-mist/40 px-5 py-4 text-sm">
              <span className="eyebrow text-accent mr-2">Schedule feed off</span>
              Set <code className="text-[11px] bg-paper px-1 rounded-sm">CFBD_API_KEY</code>{" "}
              (free from collegefootballdata.com) to auto-populate duty days. Without it,
              the tool falls back to advisor-entered totals below.
            </div>
          )}
          {scheduleStatus === "not-supported" && (
            <div className="rounded-sm border-l-2 border-accent bg-mist/40 px-5 py-4 text-sm">
              <span className="eyebrow text-accent mr-2">Sport not wired</span>
              Live schedule integration for this sport is pending. Football is
              available today via CollegeFootballData. See handoff § D1.
            </div>
          )}
          {scheduleStatus === "not-signed-in" && (
            <div className="rounded-sm border-l-2 border-accent bg-mist/40 px-5 py-4 text-sm">
              Sign in as a client with a team on file to auto-fetch the schedule.
              Otherwise this tool runs in advisor / demo mode.
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card title="Home state (domicile)">
            <select value={homeState} onChange={(e) => setHomeState(e.target.value)} className="input">
              {Object.keys(STATE_TAX_RATES).sort().map((s) => (
                <option key={s} value={s}>{s} · {(STATE_TAX_RATES[s].rate * 100).toFixed(2)}%</option>
              ))}
            </select>
            <p className="mt-3 text-xs text-slate">Asked directly, not inferred from address.</p>
          </Card>
          <Card title="Revenue-share income ($ / yr)">
            <input
              type="number"
              value={revenueShare}
              onChange={(e) => setRevenueShare(Number(e.target.value) || 0)}
              className="input tabular-nums"
              min={0}
            />
            <p className="mt-3 text-xs text-slate">
              House-settlement rev-share only. NIL income does NOT go here.
            </p>
          </Card>
          <Card title="Season span (denominator)">
            <div className="display text-3xl text-ink tabular-nums">{seasonDays} days</div>
            <p className="mt-3 text-xs text-slate">
              {useRefinement && preseasonStart
                ? `From preseason start (${preseasonStart}) through last game.`
                : `First game (${seasonStart}) through last game (${seasonEnd}).`}
            </p>
          </Card>
        </div>

        {/* Refinement */}
        <div className="mt-8 border border-line rounded-sm p-6 bg-paper">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Duty-day refinement (optional)</div>
              <div className="mt-2 text-slate text-sm max-w-xl">
                Add preseason start and any off-schedule away days for a more
                accurate estimate. Skipping keeps the schedule-only calc.
              </div>
            </div>
            <label className="text-xs text-slate flex items-center gap-2">
              <input type="checkbox" checked={useRefinement} onChange={(e) => setUseRefinement(e.target.checked)} />
              Use refinement
            </label>
          </div>

          {useRefinement && (
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <label className="block">
                <span className="field-label block mb-2">Preseason training start</span>
                <input type="date" value={preseasonStart} onChange={(e) => setPreseasonStart(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="field-label block mb-2">Additional away state</span>
                <input
                  className="input uppercase"
                  maxLength={2}
                  placeholder="e.g. NV"
                  value={extraState}
                  onChange={(e) => setExtraState(e.target.value.toUpperCase())}
                />
              </label>
              <label className="block">
                <span className="field-label block mb-2">Days there</span>
                <input
                  type="number"
                  min={0}
                  value={extraDays}
                  onChange={(e) => setExtraDays(Number(e.target.value) || 0)}
                  className="input tabular-nums"
                />
              </label>
            </div>
          )}
        </div>

        {/* Home vs away rollup */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <ResultCard
            label={`Home-state tax (${homeState})`}
            value={fmt(homeStateAfterCredit)}
            sub={`On ${fmt(homeAllocated || revenueShare)} allocated · credit ${fmt(credit)} applied`}
          />
          <ResultCard
            label="Away-state tax (all)"
            value={fmt(awayTax)}
            sub={`Across ${awayRows.length} state${awayRows.length === 1 ? "" : "s"} · ${fmt(awayAllocated)} allocated`}
          />
          <ResultCard
            label="Total estimated liability"
            value={fmt(totalAfterCredit)}
            strong
          />
        </div>

        {/* Per-state table */}
        <div className="mt-8 border border-line rounded-sm bg-paper overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-line bg-mist/60">
                <Th>State</Th>
                <Th className="text-right">Duty days</Th>
                <Th className="text-right">Share</Th>
                <Th className="text-right">Allocated income</Th>
                <Th className="text-right">Rate</Th>
                <Th className="text-right">Est. tax</Th>
                <Th>Nonresident file?</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.state} className={`border-b border-line/60 ${r.home ? "bg-mist/40" : ""}`}>
                  <Td>
                    <span className="text-ink font-medium">{r.state}</span>
                    {r.home && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-slate">home</span>
                    )}
                  </Td>
                  <Td className="text-right tabular-nums">{r.days}</Td>
                  <Td className="text-right tabular-nums">{(r.share * 100).toFixed(2)}%</Td>
                  <Td className="text-right tabular-nums">{fmt(r.allocated)}</Td>
                  <Td className="text-right tabular-nums">{(r.rate * 100).toFixed(2)}%</Td>
                  <Td className="text-right tabular-nums">{fmt(r.tax)}</Td>
                  <Td>
                    {r.nonresidentFile ? (
                      <span className="inline-flex items-center rounded-sm border border-accent text-accent px-2 py-0.5 text-[11px]">
                        File flag
                      </span>
                    ) : (
                      <span className="text-slate/60 text-xs">—</span>
                    )}
                  </Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <Td colSpan={7} className="text-xs text-slate italic">
                    No schedule loaded — nothing to allocate. Sign in with a team on file
                    and connect CFBD_API_KEY, or use the refinement to add away days manually.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-xs text-slate italic max-w-3xl">
          Duty-day formula and home-state credit logic pending tax-team sign-off.
          State rates are top-marginal (ceiling estimate) — real bracket calculation
          pending the state tax data source decision (handoff § D2).
        </div>

        <BackToHomeClient />
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line rounded-sm p-5 bg-paper">
      <div className="eyebrow">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function ResultCard({ label, value, sub, strong }: { label: string; value: string; sub?: string; strong?: boolean }) {
  return (
    <div className={`border rounded-sm p-6 ${strong ? "bg-ink text-paper border-ink" : "bg-paper border-line"}`}>
      <div className={`eyebrow ${strong ? "text-paper/70" : ""}`}>{label}</div>
      <div className={`display text-4xl mt-2 tabular-nums ${strong ? "" : "text-ink"}`}>{value}</div>
      {sub && <div className={`mt-2 text-xs ${strong ? "text-paper/60" : "text-slate"}`}>{sub}</div>}
    </div>
  );
}
function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[11px] uppercase tracking-wider text-slate font-normal ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "", colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
function fmt(n: number) { return "$" + Math.round(n).toLocaleString(); }

"use client";
// SCOPE — READ BEFORE CHANGING:
// The duty-day math here is CORRECT machinery, but it's the wrong tool for
// NIL income (NIL contracts are payment for name/image/likeness work, not
// for athletic performance — see docs/TAX-CALCULATOR-ACCURACY-GUIDE.md §6).
// It is a valid tool for House-settlement revenue-share income, which is a
// separate product-scope decision pending with Brody.
//
// Until that decision lands, this page has been removed from the athlete-
// facing tool list; leave the machinery here, do not re-point it at NIL
// income.

import { useMemo, useState } from "react";
import Link from "next/link";
import { STATE_TAX_RATES, rateFor, applyHomeStateCredit } from "@/content/tax";

// Sample season — placeholder pending real schedule API integration.
// Each entry is: state, kind, label. Duty days = 1 game day + 1 day before + 1 day after,
// with duplicate consecutive same-state days de-duplicated. Away-state activities from
// the questionnaire add extra duty days beyond the schedule.
const SAMPLE_SCHEDULE: { date: string; state: string; opponent: string; home: boolean }[] = [
  { date: "2026-08-30", state: "GA", opponent: "at Georgia",     home: false },
  { date: "2026-09-06", state: "AL", opponent: "vs Vandy",       home: true  },
  { date: "2026-09-13", state: "AL", opponent: "vs New Mexico",  home: true  },
  { date: "2026-09-20", state: "AL", opponent: "vs Arkansas",    home: true  },
  { date: "2026-09-27", state: "MS", opponent: "at Ole Miss",    home: false },
  { date: "2026-10-04", state: "AL", opponent: "vs Georgia",     home: true  },
  { date: "2026-10-11", state: "AL", opponent: "vs Oklahoma",    home: true  },
  { date: "2026-10-18", state: "TN", opponent: "at Tennessee",   home: false },
  { date: "2026-10-25", state: "AL", opponent: "vs Missouri",    home: true  },
  { date: "2026-11-08", state: "LA", opponent: "at LSU",         home: false },
  { date: "2026-11-15", state: "AL", opponent: "vs Kentucky",    home: true  },
  { date: "2026-11-22", state: "AL", opponent: "vs Mercer",      home: true  },
  { date: "2026-11-29", state: "AL", opponent: "vs Auburn",      home: true  },
  { date: "2026-12-06", state: "GA", opponent: "SEC Champ",      home: false },
  { date: "2026-12-31", state: "TX", opponent: "Bowl (Dallas)",  home: false },
];

const SEASON_START_FALLBACK = SAMPLE_SCHEDULE[0].date;
const SEASON_END = SAMPLE_SCHEDULE[SAMPLE_SCHEDULE.length - 1].date;

function daysBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

function computeDutyDays(homeState: string, preseasonStart?: string, extraDays?: { state: string; days: number }[]) {
  const byState = new Map<string, number>();

  // Preseason days count toward home-state (or wherever the athlete told us training happens;
  // in this simplified sample we attribute preseason to the home state).
  if (preseasonStart) {
    const preDays = daysBetween(preseasonStart, SAMPLE_SCHEDULE[0].date) - 1;
    if (preDays > 0) byState.set(homeState, (byState.get(homeState) ?? 0) + preDays);
  }

  // Game duty days: date, date-1, date+1 — dedupe by (state, YYYY-MM-DD).
  const seen = new Set<string>();
  for (const g of SAMPLE_SCHEDULE) {
    const gd = new Date(g.date);
    for (const offset of [-1, 0, 1]) {
      const d = new Date(gd);
      d.setDate(gd.getDate() + offset);
      const key = `${g.state}:${d.toISOString().slice(0, 10)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      byState.set(g.state, (byState.get(g.state) ?? 0) + 1);
    }
  }

  for (const e of extraDays ?? []) {
    if (!e.state || !e.days) continue;
    byState.set(e.state.toUpperCase(), (byState.get(e.state.toUpperCase()) ?? 0) + e.days);
  }
  return byState;
}

export default function JockTaxPage() {
  const [homeState, setHomeState] = useState("AL");
  const [income, setIncome] = useState(300_000);
  const [preseasonStart, setPreseasonStart] = useState("2026-08-01");
  const [extraState, setExtraState] = useState("");
  const [extraDays, setExtraDays] = useState(0);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);

  const seasonStart = showQuestionnaire && preseasonStart ? preseasonStart : SEASON_START_FALLBACK;
  const seasonDays = daysBetween(seasonStart, SEASON_END);

  const duty = useMemo(() => computeDutyDays(
    homeState,
    showQuestionnaire ? preseasonStart : undefined,
    showQuestionnaire && extraState && extraDays ? [{ state: extraState, days: extraDays }] : undefined,
  ), [homeState, preseasonStart, extraState, extraDays, showQuestionnaire]);

  const allocations = useMemo(() => {
    const rows: { state: string; days: number; share: number; allocated: number; rate: number; tax: number; nonresidentFile: boolean }[] = [];
    for (const [state, days] of duty) {
      const share = days / seasonDays;
      const allocated = income * share;
      const { rate, filingThreshold } = rateFor(state);
      const tax = allocated * rate;
      rows.push({
        state, days, share, allocated, rate, tax,
        nonresidentFile: state !== homeState && allocated > filingThreshold && filingThreshold > 0,
      });
    }
    rows.sort((a, b) => b.tax - a.tax);
    return rows;
  }, [duty, seasonDays, income, homeState]);

  const homeStateRow = allocations.find((r) => r.state === homeState);
  const awayTax = allocations.filter((r) => r.state !== homeState).reduce((s, r) => s + r.tax, 0);
  const homeStateRate = rateFor(homeState).rate;
  const homeStateGrossLiability = income * homeStateRate;
  const { credit: homeStateCredit, homeStateAfterCredit } = applyHomeStateCredit(
    homeStateGrossLiability,
    awayTax,
  );
  const totalAfterCredit = awayTax + homeStateAfterCredit;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="eyebrow">Section 07 · A</div>
        <h1 className="display text-4xl md:text-6xl mt-4 text-ink">Jock tax calculator.</h1>
        <p className="mt-4 text-slate max-w-2xl leading-relaxed">
          Duty-day allocation over a sample football schedule. Game day plus the day before
          and after count as duty days in the game&rsquo;s state. Income is allocated by
          share of duty days, each state&rsquo;s current rate is applied, and a home-state
          credit avoids double counting.
        </p>

        <div className="mt-8 rounded-sm bg-ink text-paper px-5 py-3 text-sm inline-flex items-center gap-3">
          <span className="eyebrow text-paper/70">Label</span>
          <span>Estimate for planning purposes — not a filed return.</span>
        </div>

        {/* Inputs */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card title="Home state (domicile)">
            <select
              value={homeState}
              onChange={(e) => setHomeState(e.target.value)}
              className="input"
            >
              {Object.keys(STATE_TAX_RATES).sort().map((s) => (
                <option key={s} value={s}>{s} · {(STATE_TAX_RATES[s].rate * 100).toFixed(2)}%</option>
              ))}
            </select>
            <p className="mt-3 text-xs text-slate">
              Asked directly, not inferred from address.
            </p>
          </Card>
          <Card title="Total taxable income (year)">
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value) || 0)}
              className="input tabular-nums"
              min={0}
            />
            <p className="mt-3 text-xs text-slate">
              NIL cash + non-cash (Tool B) + taxable scholarship + W-2. Placeholder input.
            </p>
          </Card>
          <Card title="Season span (denominator)">
            <div className="display text-3xl text-ink tabular-nums">{seasonDays} days</div>
            <p className="mt-3 text-xs text-slate">
              {showQuestionnaire && preseasonStart
                ? `From preseason start (${preseasonStart}) through last scheduled game.`
                : `Schedule-only fallback — first game (${SEASON_START_FALLBACK}) through last game.`}
            </p>
          </Card>
        </div>

        {/* Questionnaire */}
        <div className="mt-8 border border-line rounded-sm p-6 bg-paper">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Duty-day refinement (optional)</div>
              <div className="mt-2 text-slate text-sm max-w-xl">
                Filling this out now makes the estimate more accurate. Skipping it still
                produces a number, just a rougher one — clearly labeled as such.
              </div>
            </div>
            <label className="text-xs text-slate flex items-center gap-2">
              <input
                type="checkbox"
                checked={showQuestionnaire}
                onChange={(e) => setShowQuestionnaire(e.target.checked)}
              />
              Use refinement
            </label>
          </div>

          {showQuestionnaire && (
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <label className="block">
                <span className="field-label block mb-2">Preseason training start</span>
                <input
                  type="date"
                  value={preseasonStart}
                  onChange={(e) => setPreseasonStart(e.target.value)}
                  className="input"
                />
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
                <p className="mt-2 text-xs text-slate">
                  Bowl/media/brand trip location not in the public schedule.
                </p>
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

        {/* Results */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <ResultCard label="Away-state tax (sum)" value={fmt(awayTax)} />
          <ResultCard label="Home-state after credit" value={fmt(homeStateAfterCredit)} sub={`Credit applied: ${fmt(homeStateCredit)}`} />
          <ResultCard label="Total estimated liability" value={fmt(totalAfterCredit)} strong />
        </div>

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
              {allocations.map((r) => (
                <tr key={r.state} className={`border-b border-line/60 ${r.state === homeState ? "bg-mist/40" : ""}`}>
                  <Td>
                    <span className="text-ink font-medium">{r.state}</span>
                    {r.state === homeState && (
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
              {homeStateRow == null && (
                <tr>
                  <Td colSpan={7} className="text-xs text-slate italic">
                    Home state ({homeState}) has no duty days on this sample schedule. Home-state
                    liability shown above uses full income × home rate before credit.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-xs text-slate italic max-w-3xl">
          Version: {showQuestionnaire ? "Refined (questionnaire applied)" : "Schedule-only fallback — rougher, not refined"}.
          State rates shown are placeholders — real calc pulls from a maintained live-rate
          feed at calculation time. Duty-day formula pending tax-team sign-off.
        </div>

        <div className="mt-16 border-t border-line pt-8 flex flex-wrap justify-between gap-4">
          <Link href="/advisor" className="text-sm text-slate hover:text-accent">← Advisor roster</Link>
          <Link href="/intake" className="text-sm text-slate hover:text-accent">Client intake →</Link>
        </div>
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

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

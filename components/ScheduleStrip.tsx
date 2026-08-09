"use client";
import { useEffect, useState } from "react";
import type { ScheduleResult, ScheduleGame } from "@/lib/schedule";

export default function ScheduleStrip({
  sport,
  school,
}: {
  sport: string | null;
  school: string | null;
}) {
  const [state, setState] = useState<
    { kind: "idle" } | { kind: "loading" } | { kind: "done"; data: ScheduleResult }
  >(sport && school ? { kind: "loading" } : { kind: "idle" });

  useEffect(() => {
    if (!sport || !school) return;
    let cancelled = false;
    setState({ kind: "loading" });
    fetch(`/api/schedule?sport=${encodeURIComponent(sport)}&school=${encodeURIComponent(school)}`)
      .then((r) => r.json())
      .then((data: ScheduleResult) => {
        if (!cancelled) setState({ kind: "done", data });
      })
      .catch(() =>
        !cancelled &&
        setState({
          kind: "done",
          data: { status: "error", games: [], source: "network", error: "fetch failed" },
        }),
      );
    return () => {
      cancelled = true;
    };
  }, [sport, school]);

  if (!sport || !school) return null;

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <div className="eyebrow">This season</div>
        {state.kind === "done" && state.data.status === "ok" && (
          <div className="text-[11px] text-slate">
            {state.data.games.length} games · updated live
          </div>
        )}
      </div>

      {state.kind === "loading" && (
        <div className="py-8 text-sm text-slate italic">Loading schedule…</div>
      )}

      {state.kind === "done" && state.data.status === "ok" && (
        <ScheduleTable games={state.data.games} />
      )}

      {state.kind === "done" && state.data.status === "no-key" && (
        <div className="py-6 text-sm text-slate leading-relaxed">
          Schedule feed not configured yet. Add a{" "}
          <code className="text-xs bg-mist px-1 rounded-sm">CFBD_API_KEY</code> environment
          variable (free from collegefootballdata.com) and this section fills in
          automatically.
        </div>
      )}

      {state.kind === "done" && state.data.status === "not-supported" && (
        <div className="py-6 text-sm text-slate leading-relaxed">
          Live schedule integration for {sport} isn&rsquo;t wired yet. Football is available
          today via CollegeFootballData; other sports are pending vendor selection.
        </div>
      )}

      {state.kind === "done" && state.data.status === "error" && (
        <div className="py-6 text-sm text-slate leading-relaxed italic">
          Schedule fetch failed ({state.data.error}). Retrying automatically on next load.
        </div>
      )}
    </section>
  );
}

function ScheduleTable({ games }: { games: ScheduleGame[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm mt-4">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-slate">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Opponent</th>
            <th className="py-2 pr-4">Location</th>
            <th className="py-2 pr-4">Site</th>
          </tr>
        </thead>
        <tbody>
          {games.slice(0, 40).map((g, i) => (
            <tr key={i} className="border-t border-line/60">
              <td className="py-2 pr-4 tabular-nums text-ink">{g.date}</td>
              <td className="py-2 pr-4 text-ink">
                <span className="text-slate text-xs mr-1">
                  {g.neutralSite ? "vs" : g.home ? "vs" : "at"}
                </span>
                {g.opponent}
              </td>
              <td className="py-2 pr-4 text-slate">
                {g.city ? `${g.city}${g.state ? ", " + g.state : ""}` : "—"}
              </td>
              <td className="py-2 pr-4">
                <span
                  className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                    g.neutralSite
                      ? "bg-gold text-ink"
                      : g.home
                        ? "bg-ink text-paper"
                        : "bg-mist text-slate"
                  }`}
                >
                  {g.neutralSite ? "Neutral" : g.home ? "Home" : "Away"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

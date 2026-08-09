"use client";
import { useMemo, useState, useTransition } from "react";
import { addGoal, deleteGoal, updateGoal } from "@/app/actions/goals";

type Bucket = "SHORT" | "MEDIUM" | "LONG";
type Goal = {
  id: string;
  bucket: Bucket;
  text: string;
  years: string;
  startDate: string | null;
  endDate: string | null;
};

const PLACEHOLDERS: Record<Bucket, string[]> = {
  SHORT: ["Become a starter", "Sign first NIL deal", "Get on scholarship"],
  MEDIUM: ["Get drafted", "Go pro", "Transfer to a bigger program"],
  LONG: ["Buy my parents a house", "Retire my parents", "Build long-term wealth after playing career"],
};

const LABEL: Record<Bucket, string> = {
  SHORT: "Short-term",
  MEDIUM: "Medium-term",
  LONG: "Long-term",
};

// Horizon hints keyed off the CURRENT year — no hardcoded years that go stale.
function yearHint(bucket: Bucket): string {
  const y = new Date().getFullYear();
  switch (bucket) {
    case "SHORT":  return `${y}–${y + 1}`;
    case "MEDIUM": return `${y + 2}–${y + 6}`;
    case "LONG":   return `${y + 7}+`;
  }
}

// Default date span for a fresh entry — matches the current-year hint.
function defaultDates(bucket: Bucket): { start: string; end: string | null } {
  const y = new Date().getFullYear();
  const iso = (yy: number, mm = 1, dd = 1) =>
    `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  switch (bucket) {
    case "SHORT":  return { start: iso(y),      end: iso(y + 1, 12, 31) };
    case "MEDIUM": return { start: iso(y + 2),  end: iso(y + 6, 12, 31) };
    case "LONG":   return { start: iso(y + 7),  end: null };
  }
}

export default function GoalsClient({ initial }: { initial: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initial);
  const [, startTransition] = useTransition();

  const grouped: Record<Bucket, Goal[]> = useMemo(() => ({
    SHORT: goals.filter((g) => g.bucket === "SHORT"),
    MEDIUM: goals.filter((g) => g.bucket === "MEDIUM"),
    LONG: goals.filter((g) => g.bucket === "LONG"),
  }), [goals]);

  const add = (b: Bucket) =>
    startTransition(async () => {
      const res = await addGoal(b);
      if (!res.ok) return;
      const d = defaultDates(b);
      const y = yearHint(b);
      const newGoal: Goal = {
        id: res.goal.id,
        bucket: b,
        text: "",
        years: y,
        startDate: d.start,
        endDate: d.end,
      };
      setGoals((g) => [...g, newGoal]);
      // Persist the default dates so the export payload has them right away.
      updateGoal(res.goal.id, {
        years: y,
        startDate: d.start,
        endDate: d.end,
      });
    });

  const patch = (id: string, patchObj: Partial<Goal>) => {
    setGoals((g) => g.map((x) => (x.id === id ? { ...x, ...patchObj } : x)));
    startTransition(() => {
      updateGoal(id, {
        text: patchObj.text,
        years: patchObj.years,
        startDate: patchObj.startDate,
        endDate: patchObj.endDate,
      });
    });
  };

  const remove = (id: string) => {
    setGoals((g) => g.filter((x) => x.id !== id));
    startTransition(() => {
      deleteGoal(id);
    });
  };

  return (
    <div className="mt-12 grid md:grid-cols-3 gap-8">
      {(["SHORT", "MEDIUM", "LONG"] as Bucket[]).map((b) => (
        <div key={b}>
          <div className="eyebrow">{LABEL[b]}</div>
          <div className="text-xs text-slate mt-1">Suggested horizon: {yearHint(b)}</div>

          <ul className="mt-6 space-y-4">
            {grouped[b].map((g) => (
              <li key={g.id} className="border border-line rounded-sm p-4 bg-paper space-y-3">
                <input
                  className="input"
                  placeholder="Goal (free text)"
                  defaultValue={g.text}
                  onBlur={(e) => patch(g.id, { text: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="field-label block mb-1">Start</span>
                    <input
                      type="date"
                      className="input text-xs"
                      defaultValue={g.startDate ?? ""}
                      onBlur={(e) => patch(g.id, { startDate: e.target.value || null })}
                    />
                  </label>
                  <label className="block">
                    <span className="field-label block mb-1">End</span>
                    <input
                      type="date"
                      className="input text-xs"
                      defaultValue={g.endDate ?? ""}
                      onBlur={(e) => patch(g.id, { endDate: e.target.value || null })}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    className="input text-xs"
                    placeholder="Or a free-text horizon"
                    defaultValue={g.years}
                    onBlur={(e) => patch(g.id, { years: e.target.value })}
                  />
                  <button
                    onClick={() => remove(g.id)}
                    className="text-xs text-slate hover:text-accent whitespace-nowrap"
                    aria-label="Remove goal"
                  >
                    remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={() => add(b)}
            className="mt-4 w-full border border-dashed border-line rounded-sm py-3 text-sm text-slate hover:border-accent hover:text-accent transition"
          >
            + Add {LABEL[b].toLowerCase()} goal
          </button>

          {grouped[b].length === 0 && (
            <div className="mt-6 text-xs text-slate italic space-y-1">
              <div>Some real ones people write down:</div>
              {PLACEHOLDERS[b].map((p) => (
                <div key={p}>· {p}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

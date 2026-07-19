"use client";
import { useState, useTransition } from "react";
import { addGoal, deleteGoal, updateGoal } from "@/app/actions/goals";

type Bucket = "SHORT" | "MEDIUM" | "LONG";
type Goal = { id: string; bucket: Bucket; text: string; years: string };

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

const YEAR_HINT: Record<Bucket, string> = {
  SHORT: "2026–2027",
  MEDIUM: "2028–2032",
  LONG: "2033+",
};

export default function GoalsClient({ initial }: { initial: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initial);
  const [, startTransition] = useTransition();

  const grouped: Record<Bucket, Goal[]> = {
    SHORT: goals.filter((g) => g.bucket === "SHORT"),
    MEDIUM: goals.filter((g) => g.bucket === "MEDIUM"),
    LONG: goals.filter((g) => g.bucket === "LONG"),
  };

  const add = (b: Bucket) =>
    startTransition(async () => {
      const res = await addGoal(b);
      if (res.ok) {
        setGoals((g) => [...g, { id: res.goal.id, bucket: b, text: "", years: YEAR_HINT[b] }]);
      }
    });

  const patch = (id: string, patchObj: Partial<Goal>) => {
    setGoals((g) => g.map((x) => (x.id === id ? { ...x, ...patchObj } : x)));
    startTransition(() => {
      updateGoal(id, {
        text: patchObj.text,
        years: patchObj.years,
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
          <div className="text-xs text-slate mt-1">Suggested horizon: {YEAR_HINT[b]}</div>

          <ul className="mt-6 space-y-3">
            {grouped[b].map((g) => (
              <li key={g.id} className="border border-line rounded-sm p-3 bg-paper">
                <input
                  className="input"
                  placeholder="Goal (free text)"
                  defaultValue={g.text}
                  onBlur={(e) => patch(g.id, { text: e.target.value })}
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <input
                    className="input text-xs"
                    placeholder="2026–2027"
                    defaultValue={g.years}
                    onBlur={(e) => patch(g.id, { years: e.target.value })}
                  />
                  <button
                    onClick={() => remove(g.id)}
                    className="text-xs text-slate hover:text-accent"
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

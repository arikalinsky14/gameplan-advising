"use client";
import { useState } from "react";
import Link from "next/link";

type Bucket = "short" | "medium" | "long";
type Goal = { id: string; text: string; years: string };

const PLACEHOLDERS: Record<Bucket, string[]> = {
  short: ["Become a starter", "Sign first NIL deal", "Get on scholarship"],
  medium: ["Get drafted", "Go pro", "Transfer to a bigger program"],
  long: ["Buy my parents a house", "Retire my parents", "Build long-term wealth after playing career"],
};

const LABEL: Record<Bucket, string> = {
  short: "Short-term",
  medium: "Medium-term",
  long: "Long-term",
};

const YEAR_HINT: Record<Bucket, string> = {
  short: "2026–2027",
  medium: "2028–2032",
  long: "2033+",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Record<Bucket, Goal[]>>({
    short: [], medium: [], long: [],
  });

  const add = (b: Bucket) =>
    setGoals((g) => ({ ...g, [b]: [...g[b], { id: crypto.randomUUID(), text: "", years: YEAR_HINT[b] }] }));

  const update = (b: Bucket, id: string, patch: Partial<Goal>) =>
    setGoals((g) => ({
      ...g,
      [b]: g[b].map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));

  const remove = (b: Bucket, id: string) =>
    setGoals((g) => ({ ...g, [b]: g[b].filter((x) => x.id !== id) }));

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="eyebrow">Section 08 · Goals</div>
        <h1 className="display text-4xl md:text-6xl mt-4 text-ink">
          Tell us how high you expect to go.
        </h1>
        <p className="mt-6 text-slate max-w-2xl leading-relaxed">
          Short, medium, long. Whatever&rsquo;s in your head, drop it in — the planning
          happens around <em className="text-ink not-italic">your</em> goals, not the other
          way around. Each goal maps directly to an eMoney expense record with
          <code className="text-xs bg-mist px-1 mx-1 rounded-sm">isGoal: true</code>.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {(["short", "medium", "long"] as Bucket[]).map((b) => (
            <div key={b}>
              <div className="eyebrow">{LABEL[b]}</div>
              <div className="text-xs text-slate mt-1">Suggested horizon: {YEAR_HINT[b]}</div>

              <ul className="mt-6 space-y-3">
                {goals[b].map((g) => (
                  <li key={g.id} className="border border-line rounded-sm p-3 bg-paper">
                    <input
                      className="input"
                      placeholder="Goal (free text)"
                      value={g.text}
                      onChange={(e) => update(b, g.id, { text: e.target.value })}
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <input
                        className="input text-xs"
                        placeholder="2026–2027"
                        value={g.years}
                        onChange={(e) => update(b, g.id, { years: e.target.value })}
                      />
                      <button
                        onClick={() => remove(b, g.id)}
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

              {goals[b].length === 0 && (
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

        <div className="mt-16 border-t border-line pt-8 flex flex-wrap justify-between gap-4">
          <Link href="/intake" className="text-sm text-slate hover:text-accent">
            ← Back to intake
          </Link>
          <div className="text-xs text-slate italic">
            Saved locally on this device for the demo. Real build persists via Prisma.
          </div>
        </div>
      </div>
    </section>
  );
}

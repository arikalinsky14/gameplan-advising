"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { NIL_RULES, nilRuleFor, type NilRule } from "@/content/nil-compliance";
import BackToHomeClient from "@/components/BackToHomeClient";

export default function StateNilPage() {
  const stateCodes = useMemo(() => Object.keys(NIL_RULES).sort(), []);
  const [selected, setSelected] = useState<string[]>(["AL", "GA"]);

  const rules = selected.map((s) => nilRuleFor(s)).filter(Boolean) as NilRule[];

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="eyebrow">Section 07 · E</div>
        <h1 className="display text-4xl md:text-6xl mt-4 text-ink">State NIL compliance.</h1>
        <p className="mt-4 text-slate max-w-2xl leading-relaxed">
          Pick the states this athlete competes in or lives in. Each surfaced state shows
          its current NIL rule set — disclosure requirements, agent licensing, and any
          boosting restrictions — so both the athlete and the advisor see what applies.
        </p>

        <div className="mt-8 rounded-sm bg-mist/60 border border-line px-5 py-4 text-sm text-ink">
          <span className="eyebrow mr-2">Content note</span>
          Rules shown are a scaffold — production content requires counsel review and
          quarterly refresh. NIL law is moving fast post-House settlement.
        </div>

        <div className="mt-12 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <div className="eyebrow">States in scope</div>
            <div className="mt-4 grid grid-cols-4 gap-1 max-h-[60vh] overflow-y-auto pr-1">
              {stateCodes.map((s) => {
                const active = selected.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    className={`text-center border rounded-sm py-2 text-xs tabular-nums transition ${
                      active
                        ? "border-accent bg-ink text-paper"
                        : "border-line bg-paper text-ink hover:border-accent/60"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate">
              {selected.length} selected · click to toggle.
            </p>
          </div>

          <div className="md:col-span-8 space-y-6">
            {rules.length === 0 && (
              <div className="border border-dashed border-line rounded-sm p-8 text-sm text-slate italic">
                Pick a state to surface its rule set.
              </div>
            )}
            {rules.map((r) => (
              <RuleCard key={r.state} r={r} />
            ))}
          </div>
        </div>

        <BackToHomeClient />
      </div>
    </section>
  );
}

function RuleCard({ r }: { r: NilRule }) {
  return (
    <div className="border border-line rounded-sm p-6 bg-paper">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow">State</div>
          <div className="display text-4xl text-ink mt-1">{r.state}</div>
        </div>
        <div className="text-right">
          <div className="eyebrow">Framework</div>
          <div className="text-sm text-ink mt-1">
            {r.hasLaw ? "Statute" : r.hasEO ? "Executive order" : "School / NCAA policy only"}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Chip on={r.requiresSchoolDisclosure} label="School disclosure" />
        <Chip on={r.requiresStateRegistration} label="State registration" />
        <Chip on={r.agentLicensingRequired} label="Agent licensing" />
        <Chip on={r.boostingRestrictions !== "none"} label={`Boosting: ${r.boostingRestrictions}`} />
      </div>

      <ul className="mt-6 text-sm text-slate space-y-1 list-disc pl-5">
        {r.keyPoints.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between text-[11px] text-slate">
        <span>As of {r.lastReviewed}</span>
        {r.sourceUrl && (
          <a href={r.sourceUrl} className="hover:text-accent underline underline-offset-4" target="_blank" rel="noopener noreferrer">
            Source
          </a>
        )}
      </div>
    </div>
  );
}

function Chip({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-[11px] uppercase tracking-wider ${
        on ? "bg-ink text-paper" : "bg-mist/50 text-slate/70 line-through"
      }`}
    >
      {label}
    </span>
  );
}

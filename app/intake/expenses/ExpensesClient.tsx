"use client";
import { useMemo, useState, useTransition } from "react";
import { EXPENSE_LINES } from "@/content/expense-lines";
import { saveExpenseLine } from "@/app/actions/expenses";

export default function ExpensesClient({ initial }: { initial: Record<string, number> }) {
  const [values, setValues] = useState<Record<string, number>>(initial);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const standard = EXPENSE_LINES.filter((l) => !l.athleteSpecific);
    const athlete = EXPENSE_LINES.filter((l) => l.athleteSpecific);
    return { standard, athlete };
  }, []);

  const totals = useMemo(() => {
    let deductible = 0;
    let all = 0;
    for (const line of EXPENSE_LINES) {
      const v = values[line.slug] ?? 0;
      all += v;
      if (line.deductible) deductible += v;
    }
    return { deductible, all };
  }, [values]);

  const answered = Object.keys(values).filter((k) => values[k] !== undefined && values[k] !== null).length;

  const save = (slug: string, amount: number) => {
    setValues((v) => ({ ...v, [slug]: amount }));
    startTransition(async () => {
      const res = await saveExpenseLine(slug, amount);
      if (res.ok) {
        setSavedFlash(slug);
        setTimeout(() => setSavedFlash((s) => (s === slug ? null : s)), 900);
      }
    });
  };

  return (
    <>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Lines answered" value={`${answered} / ${EXPENSE_LINES.length}`} />
        <Tile label="Total expenses" value={fmt(totals.all)} />
        <Tile label="Deductible (business)" value={fmt(totals.deductible)} />
        <Tile label="Non-deductible" value={fmt(totals.all - totals.deductible)} />
      </div>

      <section className="mt-12">
        <div className="eyebrow">Standard</div>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {grouped.standard.map((line) => (
            <LineRow
              key={line.slug}
              line={line}
              value={values[line.slug]}
              onSave={(v) => save(line.slug, v)}
              flashSaved={savedFlash === line.slug}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="eyebrow">Athlete-specific</div>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {grouped.athlete.map((line) => (
            <LineRow
              key={line.slug}
              line={line}
              value={values[line.slug]}
              onSave={(v) => save(line.slug, v)}
              flashSaved={savedFlash === line.slug}
            />
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-slate italic">
        Autosaves as you tab out of each field. Advisor sees every change.
      </p>
    </>
  );
}

function LineRow({
  line,
  value,
  onSave,
  flashSaved,
}: {
  line: (typeof EXPENSE_LINES)[number];
  value: number | undefined;
  onSave: (v: number) => void;
  flashSaved?: boolean;
}) {
  return (
    <div className="grid grid-cols-12 items-center gap-4 py-3">
      <div className="col-span-7">
        <div className="text-ink text-sm">
          {line.label}
          {line.deductible && (
            <span className="ml-2 text-[10px] uppercase tracking-wider text-accent">
              Deductible
            </span>
          )}
        </div>
        {line.hint && <div className="text-xs text-slate mt-0.5">{line.hint}</div>}
      </div>
      <div className="col-span-4 flex items-center gap-2">
        <span className="text-slate">$</span>
        <input
          type="number"
          min={0}
          step={50}
          defaultValue={value ?? ""}
          onBlur={(e) => {
            const v = Number(e.target.value);
            onSave(Number.isFinite(v) ? v : 0);
          }}
          className="input tabular-nums text-right"
          placeholder="0"
        />
      </div>
      <div className="col-span-1 text-[11px] text-slate min-w-0">
        {flashSaved && <span className="text-accent">saved</span>}
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line rounded-sm p-4 bg-paper">
      <div className="eyebrow">{label}</div>
      <div className="display text-2xl mt-2 text-ink tabular-nums">{value}</div>
    </div>
  );
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

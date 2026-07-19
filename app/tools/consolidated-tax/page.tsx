"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  STATE_LIST, rateFor, federalTax, seTax,
  KIDDIE_TAX_UNEARNED_THRESHOLD_2024, SAFE_HARBOR_CURRENT_YEAR_PCT,
} from "@/content/tax";

const STANDARD_DEDUCTION_2024 = 14_600;
const QBI_RATE = 0.20;

export default function ConsolidatedTax() {
  // Inputs
  const [nilCash, setNilCash] = useState(250_000);
  const [nilNonCash, setNilNonCash] = useState(20_000);
  const [scholarshipTaxable, setScholarshipTaxable] = useState(15_000);
  const [w2, setW2] = useState(0);
  const [homeState, setHomeState] = useState("AL");
  const [expenses, setExpenses] = useState(35_000);
  const [claimedAsDependent, setClaimedAsDependent] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [hasEntity, setHasEntity] = useState(false);

  const result = useMemo(() => {
    const grossIncome = nilCash + nilNonCash + scholarshipTaxable + w2;
    const netSelfEmployment = Math.max(0, nilCash + nilNonCash - expenses);
    const seTaxAmount = seTax(netSelfEmployment);
    const seDeduction = seTaxAmount / 2; // deductible half

    const totalIncome = netSelfEmployment + scholarshipTaxable + w2;
    const preQbi = Math.max(0, totalIncome - seDeduction - STANDARD_DEDUCTION_2024);
    const qbi = hasEntity ? preQbi * QBI_RATE : 0;
    const taxable = Math.max(0, preQbi - qbi);

    const federal = federalTax(taxable);

    const stateRate = rateFor(homeState).rate;
    const stateTax = Math.max(0, (totalIncome - STANDARD_DEDUCTION_2024)) * stateRate;

    const total = federal + seTaxAmount + stateTax;
    const quarterly = (total * SAFE_HARBOR_CURRENT_YEAR_PCT) / 4;

    // Kiddie tax check: minor claimed as dependent, unearned income (non-cash NIL,
    // scholarship, investment income) over threshold triggers parent-rate tax on the excess.
    const unearned = nilNonCash + scholarshipTaxable;
    const kiddieTaxRisk =
      isMinor && claimedAsDependent && unearned > KIDDIE_TAX_UNEARNED_THRESHOLD_2024;

    return {
      grossIncome, netSelfEmployment, seTaxAmount, seDeduction,
      totalIncome, preQbi, qbi, taxable, federal, stateRate, stateTax, total, quarterly,
      kiddieTaxRisk, unearned,
    };
  }, [nilCash, nilNonCash, scholarshipTaxable, w2, homeState, expenses, claimedAsDependent, isMinor, hasEntity]);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="eyebrow">Section 07 · C</div>
        <h1 className="display text-4xl md:text-6xl mt-4 text-ink">Consolidated tax calculator.</h1>
        <p className="mt-4 text-slate max-w-2xl leading-relaxed">
          Gross income minus deductible expenses = net self-employment income. Apply SE tax,
          apply federal brackets, apply home-state tax. Reconciles with the jock-tax state
          allocation. QBI kicks in when an entity is elected; kiddie tax flags on minors
          claimed as dependents with unearned income over the threshold.
        </p>

        <div className="mt-8 rounded-sm bg-ink text-paper px-5 py-3 text-sm inline-flex items-center gap-3">
          <span className="eyebrow text-paper/70">Label</span>
          <span>Estimate for planning purposes — not a filed return.</span>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="eyebrow">Inputs</div>
            <NumberField label="NIL cash (yearly)" value={nilCash} onChange={setNilCash} />
            <NumberField label="NIL non-cash (FMV)" value={nilNonCash} onChange={setNilNonCash} />
            <NumberField label="Scholarship — taxable portion" value={scholarshipTaxable} onChange={setScholarshipTaxable} />
            <NumberField label="W-2 income" value={w2} onChange={setW2} />
            <NumberField label="Deductible business expenses" value={expenses} onChange={setExpenses} />
            <label className="block">
              <span className="field-label block mb-2">Home state (domicile)</span>
              <select value={homeState} onChange={(e) => setHomeState(e.target.value)} className="input">
                {STATE_LIST.map((s) => <option key={s} value={s}>{s} · {(rateFor(s).rate*100).toFixed(2)}%</option>)}
              </select>
            </label>
            <div className="border border-line rounded-sm p-4 bg-mist/40 space-y-2">
              <Check label="Athlete is under 18 (minor)"     value={isMinor}            onChange={setIsMinor} />
              <Check label="Claimed as dependent on parents' return" value={claimedAsDependent} onChange={setClaimedAsDependent} />
              <Check label="Entity in place (LLC / S-corp)"  value={hasEntity}          onChange={setHasEntity} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="eyebrow">Estimated liability</div>

            <div className="grid grid-cols-2 gap-3">
              <ResultTile label="Gross income" value={fmt(result.grossIncome)} />
              <ResultTile label="Net SE income" value={fmt(result.netSelfEmployment)} />
              <ResultTile label="SE tax (½ deductible)" value={fmt(result.seTaxAmount)} sub={`Deduction: ${fmt(result.seDeduction)}`} />
              <ResultTile label={hasEntity ? "QBI deduction" : "QBI (n/a)"} value={fmt(result.qbi)} sub={hasEntity ? "20% of QBI" : "Entity required"} />
              <ResultTile label="Federal tax" value={fmt(result.federal)} sub="2024 single brackets" />
              <ResultTile label={`State (${homeState})`} value={fmt(result.stateTax)} sub={`${(result.stateRate*100).toFixed(2)}%`} />
            </div>

            <div className="border border-ink bg-ink text-paper rounded-sm p-6">
              <div className="eyebrow text-paper/70">Total estimated tax liability</div>
              <div className="display text-5xl mt-2 tabular-nums">{fmt(result.total)}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-paper/70 text-[11px] uppercase tracking-wider">Quarterly (safe harbor 90%)</div>
                  <div className="tabular-nums">{fmt(result.quarterly)} × 4</div>
                </div>
                <div>
                  <div className="text-paper/70 text-[11px] uppercase tracking-wider">Effective rate</div>
                  <div className="tabular-nums">
                    {result.grossIncome > 0 ? ((result.total / result.grossIncome) * 100).toFixed(1) : "0.0"}%
                  </div>
                </div>
              </div>
            </div>

            {result.kiddieTaxRisk && (
              <div className="border-l-2 border-accent pl-4 py-3 bg-mist/40">
                <div className="eyebrow text-accent">Kiddie tax flag</div>
                <p className="mt-2 text-sm text-ink">
                  Unearned income ({fmt(result.unearned)}) exceeds the{" "}
                  {fmt(KIDDIE_TAX_UNEARNED_THRESHOLD_2024)} threshold. The excess is taxed at the
                  parents&rsquo; marginal rate. Route to the tax team for parent-return
                  reconciliation before finalizing this estimate.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-12 text-xs text-slate italic max-w-3xl">
          Federal brackets, standard deduction, SE base, and kiddie-tax threshold are 2024 single-filer
          snapshots. State rates from <code className="bg-mist px-1 rounded-sm">content/tax.ts</code>{" "}
          are the top marginal rate — production must swap for a maintained live feed. QBI and
          safe-harbor mechanics pending tax-team sign-off (CLAUDE.md blockers 2, 3).
        </p>

        <div className="mt-16 border-t border-line pt-8 flex flex-wrap justify-between gap-4">
          <Link href="/tools/jock-tax" className="text-sm text-slate hover:text-accent">← Jock tax</Link>
          <Link href="/advisor" className="text-sm text-slate hover:text-accent">Advisor roster →</Link>
        </div>
      </div>
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="field-label block mb-2">{label}</span>
      <input
        type="number" min={0} value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="input tabular-nums"
      />
    </label>
  );
}
function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 text-sm text-ink cursor-pointer">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
function ResultTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-line rounded-sm p-4 bg-paper">
      <div className="eyebrow">{label}</div>
      <div className="display text-2xl text-ink mt-2 tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-slate">{sub}</div>}
    </div>
  );
}
function fmt(n: number) { return "$" + Math.round(n).toLocaleString(); }

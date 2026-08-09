"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  STATE_LIST, rateFor, federalTax, seTax,
  KIDDIE_TAX_UNEARNED_THRESHOLD_2024,
  stateStandardDeduction, applyHomeStateCredit, quarterlyPayment,
  SAFE_HARBOR_METHOD,
} from "@/content/tax";
import {
  sourceContract, summarizeSourcing, netOf,
  type ContractForSourcing,
} from "@/content/nil-sourcing";
import BackToHomeClient from "@/components/BackToHomeClient";

const STANDARD_DEDUCTION_2024 = 14_600;
const QBI_RATE = 0.20;
// Placeholder — get the tax team to confirm the real §199A phase-out
// trigger for a single filer. Above this level, personal endorsement
// income is very likely SSTB and QBI phases out.
const SSTB_WARNING_THRESHOLD = 191_950;

type ClientContract = {
  id: string;
  brand: string;
  grossAmount: number;
  nonCashFmv: number;
  agentFeePct: number;
  workState: string | null;
  workStateConfirmed: boolean;
  workLog: { id: string; contractId: string; date: string; state: string; hours: number }[];
};

export default function ConsolidatedTaxClient({
  homeStateInit,
  isMinorInit,
  contracts,
}: {
  homeStateInit: string;
  isMinorInit: boolean;
  contracts: ClientContract[];
}) {
  const hasContracts = contracts.length > 0;

  // If real contracts exist we use their totals as the NIL income anchor.
  // Otherwise the manual inputs stay editable so the calculator still works
  // for advisors modeling a scenario without saved deals.
  const contractsTotals = useMemo(() => {
    let cash = 0, nonCash = 0, fee = 0;
    for (const c of contracts) {
      cash += c.grossAmount;
      nonCash += c.nonCashFmv;
      fee += c.grossAmount * (c.agentFeePct || 0);
    }
    return { cash, nonCash, fee, net: cash + nonCash - fee };
  }, [contracts]);

  const [nilCash, setNilCash] = useState(hasContracts ? contractsTotals.cash : 250_000);
  const [nilNonCash, setNilNonCash] = useState(hasContracts ? contractsTotals.nonCash : 20_000);
  const [scholarshipTaxable, setScholarshipTaxable] = useState(15_000);
  const [w2, setW2] = useState(0);
  const [homeState, setHomeState] = useState(homeStateInit);
  const [expenses, setExpenses] = useState(35_000);
  const [claimedAsDependent, setClaimedAsDependent] = useState(false);
  const [isMinor, setIsMinor] = useState(isMinorInit);
  const [hasEntity, setHasEntity] = useState(false);
  const [priorYearLiability, setPriorYearLiability] = useState<number | "">("");

  const result = useMemo(() => {
    const grossIncome = nilCash + nilNonCash + scholarshipTaxable + w2;
    const netSelfEmployment = Math.max(0, nilCash + nilNonCash - expenses);
    const seTaxAmount = seTax(netSelfEmployment);
    const seDeduction = seTaxAmount / 2;

    const totalIncome = netSelfEmployment + scholarshipTaxable + w2;
    const preQbi = Math.max(0, totalIncome - seDeduction - STANDARD_DEDUCTION_2024);
    const qbi = hasEntity ? preQbi * QBI_RATE : 0;
    const taxable = Math.max(0, preQbi - qbi);

    const federal = federalTax(taxable);

    // Per-deal NIL sourcing — replaces the old single-rate home-state calc.
    // scholarship + W-2 default to home state (documented assumption).
    const sourced = contracts.map((c) =>
      sourceContract(c as ContractForSourcing, homeState),
    );
    const { homeStateTotal, awayStateTotals, needsReview } = summarizeSourcing(sourced, homeState);

    // If the athlete has no saved contracts, treat the manual nilCash + nilNonCash
    // as home-state income by default so the number is still meaningful.
    const nonDealHomeStateIncome =
      scholarshipTaxable + w2 + (hasContracts ? 0 : nilCash + nilNonCash);
    const homeStateBase = Math.max(
      0,
      homeStateTotal + nonDealHomeStateIncome - stateStandardDeduction(homeState),
    );
    const homeStateRate = rateFor(homeState).rate;
    const homeGrossLiability = homeStateBase * homeStateRate;

    const awayBreakdown: { state: string; amount: number; tax: number; rate: number }[] = [];
    let awayStateTaxTotal = 0;
    for (const [state, amount] of awayStateTotals) {
      const info = rateFor(state);
      const taxableAway = Math.max(0, amount - stateStandardDeduction(state));
      const tax = taxableAway * info.rate;
      awayStateTaxTotal += tax;
      awayBreakdown.push({ state, amount, tax, rate: info.rate });
    }
    awayBreakdown.sort((a, b) => b.tax - a.tax);

    const { credit, homeStateAfterCredit } = applyHomeStateCredit(
      homeGrossLiability,
      awayStateTaxTotal,
    );
    const stateTax = awayStateTaxTotal + homeStateAfterCredit;

    const total = federal + seTaxAmount + stateTax;
    const priorYr = typeof priorYearLiability === "number" ? priorYearLiability : null;
    const quarterly = quarterlyPayment(total, priorYr, grossIncome);

    // See TAX-CALCULATOR-ACCURACY-GUIDE §7.4 — nilNonCash is treated as
    // earned/business income everywhere else in this calc; using it again
    // as "unearned" for kiddie-tax is inconsistent. Narrowed to scholarship
    // pending tax-team sign-off on the real classification.
    const unearned = scholarshipTaxable;
    const kiddieTaxRisk =
      isMinor && claimedAsDependent && unearned > KIDDIE_TAX_UNEARNED_THRESHOLD_2024;

    return {
      grossIncome, netSelfEmployment, seTaxAmount, seDeduction,
      totalIncome, preQbi, qbi, taxable, federal,
      homeStateTotal, homeStateBase, homeStateRate, homeGrossLiability,
      awayBreakdown, awayStateTaxTotal, credit, homeStateAfterCredit,
      stateTax, total, quarterly, kiddieTaxRisk, unearned, needsReview,
    };
  }, [
    nilCash, nilNonCash, scholarshipTaxable, w2, homeState, expenses,
    claimedAsDependent, isMinor, hasEntity, contracts, hasContracts, priorYearLiability,
  ]);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="eyebrow">Section 07 · C</div>
        <h1 className="display text-4xl md:text-6xl mt-4 text-ink">Consolidated tax calculator.</h1>
        <p className="mt-4 text-slate max-w-2xl leading-relaxed">
          Gross income minus deductible expenses = net self-employment income.
          Apply SE tax, apply federal brackets, then apply state tax with per-deal
          sourcing (each NIL contract routes its net to the state(s) where the
          work was actually performed) and a home-state credit for tax paid to
          away states.
        </p>

        <div className="mt-8 rounded-sm bg-ink text-paper px-5 py-3 text-sm inline-flex items-center gap-3">
          <span className="eyebrow text-paper/70">Label</span>
          <span>Estimate for planning purposes — not a filed return.</span>
        </div>

        {hasContracts && (
          <div className="mt-6 rounded-sm border border-line bg-mist/50 px-5 py-4 text-sm">
            <span className="eyebrow mr-2">NIL income</span>
            Anchored on {contracts.length} saved{" "}
            {contracts.length === 1 ? "contract" : "contracts"} —{" "}
            <span className="tabular-nums text-ink">${Math.round(contractsTotals.cash + contractsTotals.nonCash).toLocaleString()}</span>{" "}
            gross,{" "}
            <span className="tabular-nums text-ink">${Math.round(contractsTotals.net).toLocaleString()}</span>{" "}
            net after agent fees. Edit or add deals on the{" "}
            <Link href="/intake/contracts" className="text-accent underline underline-offset-4">Contracts page</Link>.
          </div>
        )}

        <div className="mt-12 grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="eyebrow">Inputs</div>
            <NumberField label="NIL cash (yearly)" value={nilCash} onChange={setNilCash} disabled={hasContracts} />
            <NumberField label="NIL non-cash (FMV)" value={nilNonCash} onChange={setNilNonCash} disabled={hasContracts} />
            <NumberField label="Scholarship — taxable portion" value={scholarshipTaxable} onChange={setScholarshipTaxable} />
            <NumberField label="W-2 income" value={w2} onChange={setW2} />
            <NumberField label="Deductible business expenses" value={expenses} onChange={setExpenses} />
            <label className="block">
              <span className="field-label block mb-2">Home state (domicile)</span>
              <select value={homeState} onChange={(e) => setHomeState(e.target.value)} className="input">
                {STATE_LIST.map((s) => <option key={s} value={s}>{s} · {(rateFor(s).rate * 100).toFixed(2)}%</option>)}
              </select>
            </label>
            {SAFE_HARBOR_METHOD.kind === "priorYear" && (
              <label className="block">
                <span className="field-label block mb-2">Prior-year total liability (optional)</span>
                <input
                  type="number" min={0}
                  value={priorYearLiability}
                  onChange={(e) => setPriorYearLiability(e.target.value === "" ? "" : Number(e.target.value))}
                  className="input tabular-nums"
                  placeholder="0 — uses current-year fallback"
                />
              </label>
            )}
            <div className="border border-line rounded-sm p-4 bg-mist/40 space-y-2">
              <Check label="Athlete is under 18 (minor)"                    value={isMinor}             onChange={setIsMinor} />
              <Check label="Claimed as dependent on parents' return"        value={claimedAsDependent}  onChange={setClaimedAsDependent} />
              <Check label="Entity in place (LLC / S-corp)"                 value={hasEntity}           onChange={setHasEntity} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="eyebrow">Estimated liability</div>

            <div className="grid grid-cols-2 gap-3">
              <ResultTile label="Gross income" value={fmt(result.grossIncome)} />
              <ResultTile label="Net SE income" value={fmt(result.netSelfEmployment)} />
              <ResultTile label="SE tax (½ deductible)" value={fmt(result.seTaxAmount)} sub={`Deduction: ${fmt(result.seDeduction)}`} />
              <ResultTile
                label={hasEntity ? "QBI deduction (est.)" : "QBI (n/a)"}
                value={fmt(result.qbi)}
                sub={hasEntity ? "Simplified 20% — see SSTB flag below" : "Entity required"}
              />
              <ResultTile label="Federal tax" value={fmt(result.federal)} sub="2024 single brackets" />
              <ResultTile
                label="State tax (all)"
                value={fmt(result.stateTax)}
                sub={`Home + ${result.awayBreakdown.length} away`}
              />
            </div>

            <div className="border border-ink bg-ink text-paper rounded-sm p-6">
              <div className="eyebrow text-paper/70">Total estimated tax liability</div>
              <div className="display text-5xl mt-2 tabular-nums">{fmt(result.total)}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-paper/70 text-[11px] uppercase tracking-wider">
                    Quarterly ({safeHarborLabel()})
                  </div>
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

            {/* Per-state breakdown */}
            <div className="border border-line rounded-sm bg-paper overflow-hidden">
              <div className="px-4 py-3 border-b border-line bg-mist/60">
                <div className="eyebrow">Per-state tax breakdown</div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate">
                    <th className="px-4 py-2">State</th>
                    <th className="px-4 py-2 text-right">Sourced income</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                    <th className="px-4 py-2 text-right">Est. tax</th>
                    <th className="px-4 py-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-line bg-mist/30">
                    <td className="px-4 py-2 text-ink font-medium">{homeState}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {fmt(result.homeStateTotal + (hasContracts ? 0 : nilCash + nilNonCash) + scholarshipTaxable + w2)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{(result.homeStateRate * 100).toFixed(2)}%</td>
                    <td className="px-4 py-2 text-right tabular-nums">{fmt(result.homeStateAfterCredit)}</td>
                    <td className="px-4 py-2 text-[11px] text-slate">
                      Home · credit {fmt(result.credit)} applied
                    </td>
                  </tr>
                  {result.awayBreakdown.map((r) => {
                    const filing = rateFor(r.state).filingThreshold;
                    const filingFlag = filing > 0 && r.amount > filing;
                    return (
                      <tr key={r.state} className="border-t border-line/60">
                        <td className="px-4 py-2 text-ink">{r.state}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{fmt(r.amount)}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{(r.rate * 100).toFixed(2)}%</td>
                        <td className="px-4 py-2 text-right tabular-nums">{fmt(r.tax)}</td>
                        <td className="px-4 py-2 text-[11px] text-slate">
                          {filingFlag ? (
                            <span className="inline-flex items-center rounded-sm border border-accent text-accent px-2 py-0.5">
                              Nonresident file
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {result.awayBreakdown.length === 0 && (
                    <tr className="border-t border-line/60">
                      <td colSpan={5} className="px-4 py-3 text-[11px] text-slate italic">
                        No away-state exposure — all NIL work sourced to home state.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Needs-review */}
            {result.needsReview.length > 0 && (
              <div className="border-l-2 border-accent pl-4 py-3 bg-mist/40">
                <div className="eyebrow text-accent">
                  {result.needsReview.length} deal
                  {result.needsReview.length === 1 ? "" : "s"} need advisor review
                </div>
                <p className="mt-2 text-sm text-ink leading-relaxed">
                  Work state not yet confirmed on these contracts — they&rsquo;re currently
                  defaulted to the athlete&rsquo;s home state. Confirm on the{" "}
                  <Link href="/intake/contracts" className="text-accent underline underline-offset-4">
                    Contracts page
                  </Link>{" "}
                  before finalizing this estimate.
                </p>
              </div>
            )}

            {/* QBI / SSTB warning */}
            {hasEntity && result.grossIncome > SSTB_WARNING_THRESHOLD && (
              <div className="border-l-2 border-accent pl-4 py-3 bg-mist/40">
                <div className="eyebrow text-accent">QBI may not apply at this income level</div>
                <p className="mt-2 text-sm text-ink leading-relaxed">
                  Personal endorsement income is very likely a &ldquo;specified service
                  trade or business&rdquo; under §199A. At this income level the real QBI
                  deduction may be partially or fully phased out regardless of entity
                  structure. The flat 20% shown above is a simplified placeholder — route
                  to the tax team before using this number to justify an entity election.
                </p>
              </div>
            )}

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
          Federal brackets, SE base, and kiddie-tax threshold are 2024 single-filer
          snapshots. State top-marginal rates are a ceiling estimate — bracket-accurate
          calculation for non-flat states is pending the data source decision in
          <em> docs/PHASE-1-HANDOFF.md § D2</em>. Local / municipal income taxes
          (OH, KY, AL cities) are not modeled. See{" "}
          <em>docs/TAX-CALCULATOR-ACCURACY-GUIDE.md</em> for the full open-item list.
        </p>

        <BackToHomeClient />
      </div>
    </section>
  );
}

function safeHarborLabel(): string {
  const m = SAFE_HARBOR_METHOD;
  if (m.kind === "currentYear") return `safe harbor ${(m.pct * 100).toFixed(0)}%`;
  return `safe harbor ${(m.pctUnder150k * 100).toFixed(0)}/${(m.pctOver150k * 100).toFixed(0)}%`;
}

function NumberField({
  label, value, onChange, disabled,
}: { label: string; value: number; onChange: (n: number) => void; disabled?: boolean }) {
  return (
    <label className={`block ${disabled ? "opacity-60" : ""}`}>
      <span className="field-label block mb-2">
        {label}
        {disabled && <span className="ml-2 text-[10px] normal-case text-slate italic">(from contracts)</span>}
      </span>
      <input
        type="number" min={0} value={value} disabled={disabled}
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

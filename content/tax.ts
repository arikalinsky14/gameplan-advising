// State personal income tax — top marginal rate and single-filer filing
// threshold. Sourced from each state's Department of Revenue publications
// for tax year 2024/2025 as of this build.
//
// IMPORTANT GOVERNANCE: this table is a snapshot, not a live feed. Rates,
// reciprocity agreements, filing thresholds, and bracket structures change
// annually — and mid-year rate cuts are common. Production must swap this
// for a maintained external source (state DOR data or a licensed provider
// like Wolters Kluwer / Thomson Reuters) called at calculation time.
// See CLAUDE.md Phase 1 blocker #3.

export type StateTax = {
  rate: number;           // top marginal rate for personal income tax
  filingThreshold: number; // single-filer gross-income threshold, dollars
  flat: boolean;          // true if state uses a single flat rate
  // State-level single-filer standard deduction. See TAX-CALCULATOR-ACCURACY-GUIDE §7.1:
  // real per-state numbers still need sourcing (Tax Foundation XLSX cadence).
  // 0 means "not yet populated" — used as a conservative placeholder rather
  // than defaulting silently to the federal number, which was wrong for
  // almost every state.
  standardDeduction: number;
  note?: string;          // known reciprocity, quirks, PTE-election notes
};

export const STATE_TAX_RATES: Record<string, StateTax> = {
  AL: { rate: 0.05,   filingThreshold: 1_500,  flat: false, standardDeduction: 0 },
  AK: { rate: 0.0,    filingThreshold: 0,      flat: true, standardDeduction: 0,  note: "No state personal income tax." },
  AZ: { rate: 0.025,  filingThreshold: 13_850, flat: true, standardDeduction: 0,  note: "Flat 2.5% since 2023." },
  AR: { rate: 0.039,  filingThreshold: 12_684, flat: false, standardDeduction: 0, note: "Top rate cut effective 2024." },
  CA: { rate: 0.133,  filingThreshold: 12_000, flat: false, standardDeduction: 0, note: "Includes 1% mental-health surtax over $1M." },
  CO: { rate: 0.044,  filingThreshold: 13_850, flat: true, standardDeduction: 0 },
  CT: { rate: 0.0699, filingThreshold: 15_000, flat: false, standardDeduction: 0 },
  DE: { rate: 0.066,  filingThreshold: 2_000,  flat: false, standardDeduction: 0 },
  DC: { rate: 0.1075, filingThreshold: 12_950, flat: false, standardDeduction: 0 },
  FL: { rate: 0.0,    filingThreshold: 0,      flat: true, standardDeduction: 0,  note: "No state personal income tax." },
  GA: { rate: 0.0539, filingThreshold: 12_000, flat: true, standardDeduction: 0,  note: "Moved to flat rate 2024; scheduled reductions ahead." },
  HI: { rate: 0.11,   filingThreshold: 2_200,  flat: false, standardDeduction: 0 },
  ID: { rate: 0.0569, filingThreshold: 14_600, flat: true, standardDeduction: 0 },
  IL: { rate: 0.0495, filingThreshold: 2_775,  flat: true, standardDeduction: 0,  note: "Reciprocity with IA, KY, MI, WI." },
  IN: { rate: 0.0305, filingThreshold: 1_000,  flat: true, standardDeduction: 0,  note: "Reciprocity with KY, MI, OH, PA, WI." },
  IA: { rate: 0.038,  filingThreshold: 9_000,  flat: true, standardDeduction: 0,  note: "Moved to flat rate 2025." },
  KS: { rate: 0.057,  filingThreshold: 5_250,  flat: false, standardDeduction: 0 },
  KY: { rate: 0.04,   filingThreshold: 2_770,  flat: true, standardDeduction: 0 },
  LA: { rate: 0.03,   filingThreshold: 12_500, flat: true, standardDeduction: 0,  note: "Moved to flat 3% 2025." },
  ME: { rate: 0.0715, filingThreshold: 14_600, flat: false, standardDeduction: 0 },
  MD: { rate: 0.0575, filingThreshold: 12_950, flat: false, standardDeduction: 0, note: "Local piggyback rates apply on top." },
  MA: { rate: 0.09,   filingThreshold: 8_000,  flat: false, standardDeduction: 0, note: "5% flat + 4% surtax on income over ~$1M." },
  MI: { rate: 0.0425, filingThreshold: 5_400,  flat: true, standardDeduction: 0 },
  MN: { rate: 0.0985, filingThreshold: 14_575, flat: false, standardDeduction: 0 },
  MS: { rate: 0.044,  filingThreshold: 8_300,  flat: true, standardDeduction: 0 },
  MO: { rate: 0.048,  filingThreshold: 13_850, flat: false, standardDeduction: 0 },
  MT: { rate: 0.059,  filingThreshold: 14_600, flat: false, standardDeduction: 0 },
  NE: { rate: 0.0584, filingThreshold: 8_100,  flat: false, standardDeduction: 0 },
  NV: { rate: 0.0,    filingThreshold: 0,      flat: true, standardDeduction: 0,  note: "No state personal income tax." },
  NH: { rate: 0.0,    filingThreshold: 0,      flat: true, standardDeduction: 0,  note: "No state tax on wages or NIL earnings." },
  NJ: { rate: 0.1075, filingThreshold: 10_000, flat: false, standardDeduction: 0 },
  NM: { rate: 0.059,  filingThreshold: 5_500,  flat: false, standardDeduction: 0 },
  NY: { rate: 0.109,  filingThreshold: 8_000,  flat: false, standardDeduction: 0, note: "NYC/Yonkers local income tax on residents." },
  NC: { rate: 0.0425, filingThreshold: 12_750, flat: true, standardDeduction: 0 },
  ND: { rate: 0.025,  filingThreshold: 14_600, flat: false, standardDeduction: 0 },
  OH: { rate: 0.035,  filingThreshold: 26_050, flat: false, standardDeduction: 0, note: "Reciprocity with IN, KY, MI, PA, WV." },
  OK: { rate: 0.0475, filingThreshold: 7_350,  flat: false, standardDeduction: 0 },
  OR: { rate: 0.099,  filingThreshold: 7_500,  flat: false, standardDeduction: 0 },
  PA: { rate: 0.0307, filingThreshold: 33,     flat: true, standardDeduction: 0,  note: "Reciprocity with IN, MD, NJ, OH, VA, WV." },
  RI: { rate: 0.0599, filingThreshold: 12_950, flat: false, standardDeduction: 0 },
  SC: { rate: 0.062,  filingThreshold: 13_850, flat: false, standardDeduction: 0 },
  SD: { rate: 0.0,    filingThreshold: 0,      flat: true, standardDeduction: 0,  note: "No state personal income tax." },
  TN: { rate: 0.0,    filingThreshold: 0,      flat: true, standardDeduction: 0,  note: "No state tax on wages or NIL earnings." },
  TX: { rate: 0.0,    filingThreshold: 0,      flat: true, standardDeduction: 0,  note: "No state personal income tax." },
  UT: { rate: 0.0455, filingThreshold: 13_850, flat: true, standardDeduction: 0 },
  VT: { rate: 0.0875, filingThreshold: 14_600, flat: false, standardDeduction: 0 },
  VA: { rate: 0.0575, filingThreshold: 11_950, flat: false, standardDeduction: 0 },
  WA: { rate: 0.0,    filingThreshold: 0,      flat: true, standardDeduction: 0,  note: "No wage tax; 7% capital-gains tax on gains >$262K." },
  WV: { rate: 0.0482, filingThreshold: 2_000,  flat: false, standardDeduction: 0 },
  WI: { rate: 0.0765, filingThreshold: 12_760, flat: false, standardDeduction: 0 },
  WY: { rate: 0.0,    filingThreshold: 0,      flat: true, standardDeduction: 0,  note: "No state personal income tax." },
};

export function rateFor(state: string): StateTax {
  return STATE_TAX_RATES[state.toUpperCase()] ?? {
    rate: 0,
    filingThreshold: 0,
    flat: true,
    standardDeduction: 0,
  };
}

export function stateStandardDeduction(state: string): number {
  return rateFor(state).standardDeduction;
}

// Shared home-state credit helper. Away-state tax already paid can offset
// home-state liability, but never below zero and never above what the home
// state would owe on its own. Extracted here so both /tools/jock-tax and
// /tools/consolidated-tax use the same math instead of re-deriving it.
export function applyHomeStateCredit(homeGrossLiability: number, awayStateTax: number) {
  const credit = Math.min(awayStateTax, homeGrossLiability);
  return { credit, homeStateAfterCredit: Math.max(0, homeGrossLiability - credit) };
}

export const STATE_LIST = Object.keys(STATE_TAX_RATES).sort();

// Federal rules used by the consolidated tax calculator. Tax year 2024
// single-filer bracket thresholds. Kept as a snapshot; production uses a
// maintained source.
export const FEDERAL_BRACKETS_SINGLE_2024 = [
  { upTo: 11_600,   rate: 0.10 },
  { upTo: 47_150,   rate: 0.12 },
  { upTo: 100_525,  rate: 0.22 },
  { upTo: 191_950,  rate: 0.24 },
  { upTo: 243_725,  rate: 0.32 },
  { upTo: 609_350,  rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

export const SE_TAX_RATE = 0.153;    // 12.4% SS + 2.9% Medicare on 92.35% of SE earnings
export const SE_TAX_BASE = 0.9235;
export const SS_WAGE_BASE_2024 = 168_600;
export const ADDITIONAL_MEDICARE = 0.009; // over $200k single
export const ADDITIONAL_MEDICARE_THRESHOLD = 200_000;

export const KIDDIE_TAX_UNEARNED_THRESHOLD_2024 = 2_600;

export const SAFE_HARBOR_PCT_UNDER_150K = 1.00;  // 100% of prior-year liability
export const SAFE_HARBOR_PCT_OVER_150K  = 1.10;  // 110% for higher earners
export const SAFE_HARBOR_CURRENT_YEAR_PCT = 0.90; // OR 90% of current-year

// Which safe-harbor rule the calculator applies for quarterly estimated
// payments. Configurable so switching to the firm's real policy is a
// one-line change; see TAX-CALCULATOR-ACCURACY-GUIDE §7.5 and
// PHASE-1-HANDOFF § B2. The placeholder is currentYear/90%.
export type SafeHarborMethod =
  | { kind: "currentYear"; pct: number }
  | { kind: "priorYear"; pctUnder150k: number; pctOver150k: number };

export const SAFE_HARBOR_METHOD: SafeHarborMethod = {
  kind: "currentYear",
  pct: SAFE_HARBOR_CURRENT_YEAR_PCT,
};

export function quarterlyPayment(
  currentYearLiability: number,
  priorYearLiability: number | null,
  agi: number,
): number {
  const m = SAFE_HARBOR_METHOD;
  if (m.kind === "currentYear") {
    return (currentYearLiability * m.pct) / 4;
  }
  const anchor = priorYearLiability ?? currentYearLiability;
  const pct = agi > 150_000 ? m.pctOver150k : m.pctUnder150k;
  return (anchor * pct) / 4;
}

export function federalTax(taxableIncome: number): number {
  let remaining = taxableIncome;
  let owed = 0;
  let lastCap = 0;
  for (const b of FEDERAL_BRACKETS_SINGLE_2024) {
    if (remaining <= 0) break;
    const span = b.upTo - lastCap;
    const chunk = Math.min(remaining, span);
    owed += chunk * b.rate;
    remaining -= chunk;
    lastCap = b.upTo;
  }
  return owed;
}

export function seTax(netEarnings: number): number {
  const base = netEarnings * SE_TAX_BASE;
  const ss = Math.min(base, SS_WAGE_BASE_2024) * 0.124;
  const medicare = base * 0.029;
  const addl = base > ADDITIONAL_MEDICARE_THRESHOLD
    ? (base - ADDITIONAL_MEDICARE_THRESHOLD) * ADDITIONAL_MEDICARE : 0;
  return ss + medicare + addl;
}

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
  note?: string;          // known reciprocity, quirks, PTE-election notes
};

export const STATE_TAX_RATES: Record<string, StateTax> = {
  AL: { rate: 0.05,   filingThreshold: 1_500,  flat: false },
  AK: { rate: 0.0,    filingThreshold: 0,      flat: true,  note: "No state personal income tax." },
  AZ: { rate: 0.025,  filingThreshold: 13_850, flat: true,  note: "Flat 2.5% since 2023." },
  AR: { rate: 0.039,  filingThreshold: 12_684, flat: false, note: "Top rate cut effective 2024." },
  CA: { rate: 0.133,  filingThreshold: 12_000, flat: false, note: "Includes 1% mental-health surtax over $1M." },
  CO: { rate: 0.044,  filingThreshold: 13_850, flat: true },
  CT: { rate: 0.0699, filingThreshold: 15_000, flat: false },
  DE: { rate: 0.066,  filingThreshold: 2_000,  flat: false },
  DC: { rate: 0.1075, filingThreshold: 12_950, flat: false },
  FL: { rate: 0.0,    filingThreshold: 0,      flat: true,  note: "No state personal income tax." },
  GA: { rate: 0.0539, filingThreshold: 12_000, flat: true,  note: "Moved to flat rate 2024; scheduled reductions ahead." },
  HI: { rate: 0.11,   filingThreshold: 2_200,  flat: false },
  ID: { rate: 0.0569, filingThreshold: 14_600, flat: true },
  IL: { rate: 0.0495, filingThreshold: 2_775,  flat: true,  note: "Reciprocity with IA, KY, MI, WI." },
  IN: { rate: 0.0305, filingThreshold: 1_000,  flat: true,  note: "Reciprocity with KY, MI, OH, PA, WI." },
  IA: { rate: 0.038,  filingThreshold: 9_000,  flat: true,  note: "Moved to flat rate 2025." },
  KS: { rate: 0.057,  filingThreshold: 5_250,  flat: false },
  KY: { rate: 0.04,   filingThreshold: 2_770,  flat: true },
  LA: { rate: 0.03,   filingThreshold: 12_500, flat: true,  note: "Moved to flat 3% 2025." },
  ME: { rate: 0.0715, filingThreshold: 14_600, flat: false },
  MD: { rate: 0.0575, filingThreshold: 12_950, flat: false, note: "Local piggyback rates apply on top." },
  MA: { rate: 0.09,   filingThreshold: 8_000,  flat: false, note: "5% flat + 4% surtax on income over ~$1M." },
  MI: { rate: 0.0425, filingThreshold: 5_400,  flat: true },
  MN: { rate: 0.0985, filingThreshold: 14_575, flat: false },
  MS: { rate: 0.044,  filingThreshold: 8_300,  flat: true },
  MO: { rate: 0.048,  filingThreshold: 13_850, flat: false },
  MT: { rate: 0.059,  filingThreshold: 14_600, flat: false },
  NE: { rate: 0.0584, filingThreshold: 8_100,  flat: false },
  NV: { rate: 0.0,    filingThreshold: 0,      flat: true,  note: "No state personal income tax." },
  NH: { rate: 0.0,    filingThreshold: 0,      flat: true,  note: "No state tax on wages or NIL earnings." },
  NJ: { rate: 0.1075, filingThreshold: 10_000, flat: false },
  NM: { rate: 0.059,  filingThreshold: 5_500,  flat: false },
  NY: { rate: 0.109,  filingThreshold: 8_000,  flat: false, note: "NYC/Yonkers local income tax on residents." },
  NC: { rate: 0.0425, filingThreshold: 12_750, flat: true },
  ND: { rate: 0.025,  filingThreshold: 14_600, flat: false },
  OH: { rate: 0.035,  filingThreshold: 26_050, flat: false, note: "Reciprocity with IN, KY, MI, PA, WV." },
  OK: { rate: 0.0475, filingThreshold: 7_350,  flat: false },
  OR: { rate: 0.099,  filingThreshold: 7_500,  flat: false },
  PA: { rate: 0.0307, filingThreshold: 33,     flat: true,  note: "Reciprocity with IN, MD, NJ, OH, VA, WV." },
  RI: { rate: 0.0599, filingThreshold: 12_950, flat: false },
  SC: { rate: 0.062,  filingThreshold: 13_850, flat: false },
  SD: { rate: 0.0,    filingThreshold: 0,      flat: true,  note: "No state personal income tax." },
  TN: { rate: 0.0,    filingThreshold: 0,      flat: true,  note: "No state tax on wages or NIL earnings." },
  TX: { rate: 0.0,    filingThreshold: 0,      flat: true,  note: "No state personal income tax." },
  UT: { rate: 0.0455, filingThreshold: 13_850, flat: true },
  VT: { rate: 0.0875, filingThreshold: 14_600, flat: false },
  VA: { rate: 0.0575, filingThreshold: 11_950, flat: false },
  WA: { rate: 0.0,    filingThreshold: 0,      flat: true,  note: "No wage tax; 7% capital-gains tax on gains >$262K." },
  WV: { rate: 0.0482, filingThreshold: 2_000,  flat: false },
  WI: { rate: 0.0765, filingThreshold: 12_760, flat: false },
  WY: { rate: 0.0,    filingThreshold: 0,      flat: true,  note: "No state personal income tax." },
};

export function rateFor(state: string): StateTax {
  return STATE_TAX_RATES[state.toUpperCase()] ?? { rate: 0, filingThreshold: 0, flat: true };
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

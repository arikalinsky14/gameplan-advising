// NIL income sourcing.
//
// NIL contracts are payment for name/image/likeness work — endorsements,
// content, appearances — not payment for athletic performance. State income
// tax is therefore sourced to WHERE the work was performed, not to the
// team's game schedule. This module replaces the duty-day allocator as the
// thing that decides which state(s) a contract's income belongs to.
//
// Two shapes of contract are handled:
//   1. One-off deal — single `workState` on the contract itself. The whole
//      net rolls into that state.
//   2. Long-term deal — a `workLog` of dated, state-tagged, hours-weighted
//      entries. Net is split across states in proportion to hours worked.
//
// If neither is present, the deal defaults to the athlete's home state and
// is marked unconfirmed, so the calling UI can surface it for advisor
// review rather than silently baking it into a total.

export type WorkLogEntry = {
  id: string;
  contractId: string;
  date: Date | string;
  state: string;
  hours: number;
};

export type ContractForSourcing = {
  id: string;
  grossAmount: number;
  nonCashFmv: number;
  agentFeePct: number;
  workState?: string | null;
  workStateConfirmed: boolean;
  workLog?: WorkLogEntry[];
};

export type StateAllocation = {
  state: string;
  amount: number;
  fraction: number;     // 0..1 of the deal's net
};

export type SourcedContract = {
  contractId: string;
  net: number;
  allocations: StateAllocation[];  // sums to `net`
  confirmed: boolean;
  method: "work-log" | "single-state" | "home-state-fallback";
};

export function netOf(contract: {
  grossAmount: number;
  nonCashFmv: number;
  agentFeePct: number;
}): number {
  return (contract.grossAmount + contract.nonCashFmv) * (1 - (contract.agentFeePct || 0));
}

export function sourceContract(
  contract: ContractForSourcing,
  homeState: string,
): SourcedContract {
  const home = (homeState || "").toUpperCase();
  const net = netOf(contract);
  const log = contract.workLog ?? [];

  // Case 1: work log present — hours-weighted split.
  if (log.length > 0) {
    const hoursByState = new Map<string, number>();
    let totalHours = 0;
    for (const e of log) {
      const s = (e.state || "").toUpperCase();
      if (!s) continue;
      const h = Number.isFinite(e.hours) && e.hours > 0 ? e.hours : 0;
      if (h === 0) continue;
      hoursByState.set(s, (hoursByState.get(s) ?? 0) + h);
      totalHours += h;
    }
    if (totalHours > 0) {
      const allocations: StateAllocation[] = [];
      for (const [state, hours] of hoursByState) {
        const fraction = hours / totalHours;
        allocations.push({ state, amount: net * fraction, fraction });
      }
      return {
        contractId: contract.id,
        net,
        allocations,
        confirmed: true, // presence of a work log is itself a confirmation
        method: "work-log",
      };
    }
  }

  // Case 2: single work state.
  if (contract.workState && contract.workState.trim()) {
    const state = contract.workState.trim().toUpperCase();
    return {
      contractId: contract.id,
      net,
      allocations: [{ state, amount: net, fraction: 1 }],
      confirmed: !!contract.workStateConfirmed,
      method: "single-state",
    };
  }

  // Case 3: nothing on the contract. Default to home state but flag unconfirmed.
  return {
    contractId: contract.id,
    net,
    allocations: [{ state: home || "??", amount: net, fraction: 1 }],
    confirmed: false,
    method: "home-state-fallback",
  };
}

// Groups per-contract allocations into a home vs. away rollup for the tax
// calculator, and separately lists any contracts that still need advisor
// confirmation before the total is trustworthy.
export function summarizeSourcing(sourced: SourcedContract[], homeState: string) {
  const home = (homeState || "").toUpperCase();
  let homeStateTotal = 0;
  const awayStateTotals = new Map<string, number>();
  const needsReview: SourcedContract[] = [];

  for (const s of sourced) {
    if (!s.confirmed) needsReview.push(s);
    for (const a of s.allocations) {
      if (a.state === home) {
        homeStateTotal += a.amount;
      } else {
        awayStateTotals.set(a.state, (awayStateTotals.get(a.state) ?? 0) + a.amount);
      }
    }
  }
  return { homeStateTotal, awayStateTotals, needsReview };
}

// Nonresident-filing flag — re-keyed off deal-sourced income rather than
// duty-day allocation (see TAX-CALCULATOR-ACCURACY-GUIDE §7.7).
export function nonresidentFilingRequired(
  state: string,
  amount: number,
  homeState: string,
  filingThreshold: number,
): boolean {
  return (
    state !== homeState.toUpperCase() &&
    amount > filingThreshold &&
    filingThreshold > 0
  );
}

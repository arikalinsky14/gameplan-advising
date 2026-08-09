// eMoney Facts export payload builder.
//
// The shape below mirrors the eMoney Client Data / Plan Data collections we've
// confirmed via the developer portal research:
//   - Income, Expense, Asset, Liability are top-level Facts collections
//   - Goals are Expense records with isGoal: true
//   - Expense records carry: name, start date, end date, amount, type
//
// The `type` enum values are the one thing we CANNOT confirm without an
// authenticated eMoney developer portal session. Every `type` field in this
// payload is set to "UNKNOWN__PENDING_EMONEY_PORTAL_ACCESS" so downstream
// consumers see it immediately. Swap those for the real enum values once
// Cerity gets Expanded Planning access provisioned (see docs/PHASE-1-HANDOFF.md).
//
// This is a Phase-1 target for MANUAL entry — the advisor pastes fields into
// eMoney by hand at launch. Phase 2 wraps this in a POST to the eMoney API
// with OAuth 2.0 + X.509 client-assertion.

import type { Prisma } from "@prisma/client";

const UNKNOWN_TYPE = "UNKNOWN__PENDING_EMONEY_PORTAL_ACCESS";

export type EMoneyFactsPayload = {
  version: "0.1-scaffold";
  generatedAt: string;
  disclaimer: string;
  athlete: {
    id: string;
    firstName: string;
    lastName: string;
    dob: string | null;
    isMinor: boolean;
    domicileState: string | null;
    domicileAmbiguousFlag: boolean;
    sport: string | null;
    school: string | null;
  };
  income: EMoneyIncome[];
  expenses: EMoneyExpense[];
  goals: EMoneyGoal[];
  assets: EMoneyAsset[];
  liabilities: EMoneyLiability[];
  taxSummary: {
    latestJockTax?: unknown;
    latestConsolidated?: unknown;
  };
  advisorNotes: { field: string; from: string | null; to: string | null; reason: string; at: string }[];
  openQuestions: string[];
};

export type EMoneyIncome  = { name: string; amount: number; type: string };
export type EMoneyExpense = { name: string; amount: number; type: string; isGoal: false; startDate: string | null; endDate: string | null };
export type EMoneyGoal    = { name: string; amount: number; type: string; isGoal: true;  startDate: string | null; endDate: string | null };
export type EMoneyAsset      = { name: string; amount: number; type: string };
export type EMoneyLiability  = { name: string; amount: number; type: string };

type AthleteWithChildren = Prisma.AthleteGetPayload<{
  include: {
    goals: true;
    contracts: true;
    expenses: true;
    taxSnapshots: true;
    overrides: true;
    owner: true;
  };
}>;

export function buildFactsPayload(a: AthleteWithChildren): EMoneyFactsPayload {
  const jock = a.taxSnapshots.filter((s) => s.kind === "JOCK_TAX").at(-1);
  const cons = a.taxSnapshots.filter((s) => s.kind === "CONSOLIDATED").at(-1);

  return {
    version: "0.1-scaffold",
    generatedAt: new Date().toISOString(),
    disclaimer:
      "Estimate for planning purposes — not a filed return. All numeric outputs " +
      "must be reviewed by a Cerity Partners advisor before entry into an eMoney plan.",

    athlete: {
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      dob: a.dob ? a.dob.toISOString().slice(0, 10) : null,
      isMinor: a.isMinor,
      domicileState: a.homeState,
      domicileAmbiguousFlag: a.domicileAmbiguousFlag,
      sport: a.sport,
      school: a.teamSchool,
    },

    income: [
      // Contract cash + non-cash. Real breakout by brand once eMoney's Income.type
      // enum is confirmed.
      ...a.contracts.flatMap<EMoneyIncome>((c) => {
        const rows: EMoneyIncome[] = [];
        if (c.grossAmount > 0)
          rows.push({ name: `NIL cash — ${c.brand}`, amount: c.grossAmount, type: UNKNOWN_TYPE });
        if (c.nonCashFmv > 0)
          rows.push({ name: `NIL non-cash — ${c.brand}`, amount: c.nonCashFmv, type: UNKNOWN_TYPE });
        return rows;
      }),
      ...(a.scholarshipTaxable > 0
        ? [{ name: "Scholarship — taxable portion", amount: a.scholarshipTaxable, type: UNKNOWN_TYPE } as EMoneyIncome]
        : []),
    ],

    expenses: a.expenses.map<EMoneyExpense>((e) => ({
      name: e.category,
      amount: e.amount,
      type: UNKNOWN_TYPE,
      isGoal: false,
      startDate: null,
      endDate: null,
    })),

    goals: a.goals.map<EMoneyGoal>((g) => {
      // Prefer real dates from the picker; fall back to parsing the free-text
      // years string for legacy records.
      const [parsedStart, parsedEnd] = parseYearsRange(g.years);
      const start = g.startDate ? g.startDate.toISOString().slice(0, 10) : parsedStart;
      const end = g.endDate ? g.endDate.toISOString().slice(0, 10) : parsedEnd;
      return {
        name: g.text || `[${g.bucket.toLowerCase()}-term goal]`,
        amount: g.amount ?? 0,
        type: UNKNOWN_TYPE,
        isGoal: true,
        startDate: start,
        endDate: end,
      };
    }),

    assets: [],       // Phase 2: sourced from eMoney's Schwab/Fidelity aggregation
    liabilities: [],  // Phase 2: sourced from statement-upload extraction

    taxSummary: {
      latestJockTax: jock?.outputJson,
      latestConsolidated: cons?.outputJson,
    },

    advisorNotes: a.overrides.map((o) => ({
      field: o.field,
      from: o.fromValue,
      to: o.toValue,
      reason: o.reason,
      at: o.createdAt.toISOString(),
    })),

    openQuestions: [
      a.domicileAmbiguousFlag ? "Confirm state of legal domicile with athlete." : null,
      a.isMinor ? "Custodial account structure required — confirm parent/guardian details." : null,
      "Confirm eMoney Expense record `type` enum values before API push (Phase 2).",
    ].filter(Boolean) as string[],
  };
}

// Parse "2026-2027" / "2026–2027" / "2033+" into a [start, end] ISO date pair.
// Best-effort — the year range is free-text on the client side.
function parseYearsRange(years: string): [string | null, string | null] {
  const m = years.match(/(\d{4})\s*[–\-to]+\s*(\d{4})/i);
  if (m) return [`${m[1]}-01-01`, `${m[2]}-12-31`];
  const single = years.match(/(\d{4})/);
  if (single) return [`${single[1]}-01-01`, null];
  return [null, null];
}

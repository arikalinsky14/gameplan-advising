# Tax Calculator Accuracy — Implementation Guide

**Audience:** coding agent implementing changes to the Game Plan Action repo.
**Do not treat this as a green light to invent tax law.** This doc follows the same
governance rules already in `CLAUDE.md`: formula/methodology changes need tax-team
sign-off before they ship to a client. Every recommendation below is tagged with a
priority and a sign-off status — respect the tags. When in doubt, add a flag for
advisor review rather than silently resolving an ambiguous case.

Suggested home for this file once implemented: `docs/TAX-CALCULATOR-ACCURACY-GUIDE.md`,
alongside `docs/PHASE-1-HANDOFF.md`, which this doc supplements (it doesn't replace it).

---

## 0. The core finding this guide is built around

NIL compensation is legally **not** payment for athletic performance — it's payment
for name/image/likeness use (endorsements, content, appearances), and NCAA/state NIL
frameworks explicitly prohibit "pay for play." That means the duty-day / jock-tax
sourcing model (which exists specifically to source *athletic performance* income to
the states where games were played) doesn't have a legal basis when applied to NIL
contract income. Right now the site applies it anyway:

- `/tools/jock-tax` spreads the athlete's **entire income figure** (its own label says
  "NIL cash + non-cash + taxable scholarship + W-2") across away-game states by duty-day
  share — including NIL dollars that have nothing to do with the football schedule.
- `/tools/consolidated-tax` does the opposite: it taxes **100% of income at the home
  state rate only** and never touches the duty-day allocation, despite footer copy
  claiming it "reconciles with the jock-tax state allocation."

Neither tool currently asks the one question that actually matters for NIL sourcing:
**where was the work for this specific deal performed?** Most of what follows exists
to fix that.

---

## 1. Summary table (start here)

| # | Area | File(s) | Change | Priority | Sign-off needed? |
|---|------|---------|--------|----------|-------------------|
| 2 | Data model | `prisma/schema.prisma` | Add `workState` (+ confirmation flag) to `Contract` | P0 | No — structural |
| 3 | New sourcing logic | `content/nil-sourcing.ts` (new) | Per-deal state sourcing function | P0 | No — mechanical |
| 4 | Shared credit helper | `content/tax.ts` | Extract `applyHomeStateCredit()` | P0 | No — refactor |
| 5 | Consolidated tax | `app/tools/consolidated-tax/page.tsx` | Consume per-deal sourcing instead of 100%-home-state | P0 | No — wiring |
| 6 | Jock tax tool | `app/tools/jock-tax/page.tsx` | Repurpose/gate, don't delete | P1 | Product (Brody) |
| 7.1 | State tax base | `app/tools/consolidated-tax/page.tsx`, `content/tax.ts` | Stop using federal standard deduction for state base | P1 | Data source needed |
| 7.2 | State rate method | `content/tax.ts` | Top-marginal vs. bracket — decide and label | P2 | **Yes — tax team** |
| 7.3 | QBI | `app/tools/consolidated-tax/page.tsx` | Add SSTB warning banner (not full phase-out math) | P1 | Partial — see below |
| 7.4 | Kiddie tax classification | `app/tools/consolidated-tax/page.tsx` | Flag NIL non-cash vs. unearned inconsistency | P1 | **Yes — tax team** |
| 7.5 | Safe harbor anchor | `content/tax.ts` | Make anchor configurable, don't hardcode 90% | P2 | **Yes — firm policy** |
| 7.6 | Local/municipal tax | — | Document as known limitation | P3 | No — deferred |
| 7.7 | Nonresident filing flag | `content/nil-sourcing.ts` | Re-key off deal-sourced income, not duty-days | P0 | No — follows #3 |
| 8 | UI/copy | Contracts form, both tax pages | Add work-state field, fix reconciliation claims | P0 | No |
| 9 | Tests | new | Verification scenarios | P0 | No |

---

## 2. Data model: add work-state to `Contract`

`prisma/schema.prisma` currently has no field capturing where a deal's deliverable was
performed. Add:

```prisma
model Contract {
  // ...existing fields...

  // Where the deal's deliverable was actually performed (shoot location, appearance
  // city, etc.) — NOT the athlete's home state and NOT tied to the game schedule.
  // Null/blank means "not yet asked" — do not silently default this to home state
  // in the data layer; the sourcing function (section 3) handles the default and
  // marks it unconfirmed so it surfaces for advisor review, consistent with the
  // "ambiguous cases must be flagged, not silently inferred" rule in CLAUDE.md.
  workState          String?
  workStateConfirmed Boolean @default(false)
}
```

Keep this to a single state for the MVP — most individual deals (one shoot, one
appearance, one signing) happen in one place. A fast-follow `ContractLocation`
join table (`contractId`, `state`, `days`) can support true multi-state deals (e.g.,
a multi-city tour) later; don't build that now, it's not blocking.

Migration: standard `prisma db push` per the existing deploy flow in `README.md`.

---

## 3. New file: `content/nil-sourcing.ts`

This replaces the duty-day allocator as the thing that decides which state(s) a
contract's income belongs to.

```ts
import { rateFor } from "@/content/tax";

export type SourcedContract = {
  contractId: string;
  net: number;              // (gross + nonCashFmv) * (1 - agentFeePct)
  state: string;            // resolved state — workState if set, else home state
  confirmed: boolean;       // false => surface for advisor review, don't treat as final
};

export function sourceContract(
  contract: {
    id: string;
    grossAmount: number;
    nonCashFmv: number;
    agentFeePct: number;
    workState?: string | null;
    workStateConfirmed: boolean;
  },
  homeState: string
): SourcedContract {
  const net = (contract.grossAmount + contract.nonCashFmv) * (1 - contract.agentFeePct);
  const state = (contract.workState || homeState).toUpperCase();
  return {
    contractId: contract.id,
    net,
    state,
    confirmed: contract.workStateConfirmed,
  };
}

// Groups sourced contracts into home-state vs. away-state totals, and — separately —
// lists any unconfirmed away-state contracts so the UI can flag them rather than
// quietly rolling them into a total the advisor hasn't reviewed.
export function summarizeSourcing(sourced: SourcedContract[], homeState: string) {
  const home = homeState.toUpperCase();
  let homeStateTotal = 0;
  const awayStateTotals = new Map<string, number>();
  const needsReview: SourcedContract[] = [];

  for (const s of sourced) {
    if (!s.confirmed && s.state !== home) needsReview.push(s);
    if (s.state === home) {
      homeStateTotal += s.net;
    } else {
      awayStateTotals.set(s.state, (awayStateTotals.get(s.state) ?? 0) + s.net);
    }
  }
  return { homeStateTotal, awayStateTotals, needsReview };
}
```

Note: scholarship-taxable and W-2 income are **not** deal-sourced — they're not from
NIL contracts. Default assumption (document this inline, don't hide it): both are
sourced to home state / school state for the MVP. That's a reasonable simplification;
flag it as an assumption in the UI copy, don't silently bake it in as if it were fact.

---

## 4. Extract the home-state credit logic into `content/tax.ts`

This math already exists correctly inline in `app/tools/jock-tax/page.tsx`. Pull it
out so both tools use the same function instead of Tool C re-deriving (or, currently,
ignoring) it:

```ts
// content/tax.ts
export function applyHomeStateCredit(homeGrossLiability: number, awayStateTax: number) {
  const credit = Math.min(awayStateTax, homeGrossLiability);
  return { credit, homeStateAfterCredit: Math.max(0, homeGrossLiability - credit) };
}
```

Update `app/tools/jock-tax/page.tsx` to import this instead of computing it inline
(no behavior change there — pure refactor).

---

## 5. Rewire `/tools/consolidated-tax`

Replace the current single-rate state tax block:

```ts
// current — do not keep
const stateRate = rateFor(homeState).rate;
const stateTax = Math.max(0, (totalIncome - STANDARD_DEDUCTION_2024)) * stateRate;
```

with logic that sums home-state tax on non-deal income plus per-deal sourced income,
applies each state's rate, and credits away-state tax against home-state liability:

```ts
import { sourceContract, summarizeSourcing } from "@/content/nil-sourcing";
import { applyHomeStateCredit } from "@/content/tax";

// contracts: Contract[] passed in as a prop/fetch — this page currently has no
// contract data at all; it needs to start reading from the Contract table.
const sourced = contracts.map((c) => sourceContract(c, homeState));
const { homeStateTotal, awayStateTotals, needsReview } = summarizeSourcing(sourced, homeState);

// Non-deal income (scholarship, W-2) still defaults to home state — see note in section 3.
const homeStateBase = homeStateTotal + scholarshipTaxable + w2 - /* deductible expenses handling, keep existing SE logic */ 0;

const homeGrossLiability = Math.max(0, homeStateBase - stateStandardDeduction(homeState)) * rateFor(homeState).rate;

let awayStateTaxTotal = 0;
const awayBreakdown: { state: string; amount: number; tax: number }[] = [];
for (const [state, amount] of awayStateTotals) {
  const tax = Math.max(0, amount - stateStandardDeduction(state)) * rateFor(state).rate;
  awayStateTaxTotal += tax;
  awayBreakdown.push({ state, amount, tax });
}

const { credit, homeStateAfterCredit } = applyHomeStateCredit(homeGrossLiability, awayStateTaxTotal);
const stateTax = awayStateTaxTotal + homeStateAfterCredit;
```

`stateStandardDeduction(state)` doesn't exist yet — see section 7.1 below.

**UI change to go with this:** replace the single `ResultTile` for state tax with a
small breakdown table (home state + each away state, similar in shape to the
allocation table already built in Tool A) so the advisor can see where each dollar of
state tax is coming from, plus a visible list of `needsReview` contracts ("3 deals
don't have a confirmed work state yet — defaulting to home state until confirmed").

Also fix the footer copy — it currently claims the tool "reconciles with the jock-tax
state allocation," which becomes true again once this ships, but isn't true today.

---

## 6. Repurpose, don't delete, the Jock Tax tool

Per the earlier discussion: the duty-day math is legally the wrong tool for NIL income,
but it's the *right* tool for a different, real income category — school revenue-share
payments under the House v. NCAA settlement, which (unlike NIL) genuinely are
compensation tied to being on the roster and participating.

Whether revenue-share income is in scope for this product is a **product decision for
Brody**, not something to resolve in code. Until that's answered:

- **Do not delete** `computeDutyDays`, the allocation table, or the home-state-credit
  logic in `app/tools/jock-tax/page.tsx` — it's correct machinery, just currently
  pointed at the wrong income.
- Remove it from the default athlete-facing tool list on `app/advisor/[id]/page.tsx`
  and `app/intake/page.tsx` (`HomeCard` for "Jock tax estimate") until the scope
  question is answered, so advisors and clients don't rely on a number that's sourcing
  NIL income incorrectly today.
- Add a code comment at the top of the file pointing at this doc and
  `docs/PHASE-1-HANDOFF.md`, so a future dev doesn't "fix" the tool by re-pointing it
  at NIL income again.
- If/when revenue-share is confirmed in scope: add a `revenueShare` income field
  (schema + Consolidated Tax input), and rewire this tool's income input to pull from
  *that* field only — never from `nilCash`/`nilNonCash`.

---

## 7. Individual calculation fixes

### 7.1 State tax base uses the wrong standard deduction — P1, needs a data source

`content/tax.ts`'s `StateTax` type has no state-level standard deduction; both tools
currently subtract the **federal** $14,600 figure from state-taxable income, which is
wrong for nearly every state. Add a field:

```ts
export type StateTax = {
  rate: number;
  filingThreshold: number;
  flat: boolean;
  standardDeduction: number;   // NEW — state's own single-filer standard deduction, 0 if none
  note?: string;
};
```

This needs real per-state figures — same sourcing conversation already flagged in
`docs/PHASE-1-HANDOFF.md` section D2 (Tax Foundation XLSX, refreshed annually). Don't
invent numbers; wire the field in and leave it `0` with a visible "not yet populated"
note per state until the data lands, rather than guessing.

### 7.2 Top-marginal rate vs. bracket-based state tax — P2, **needs tax-team sign-off**

For every state marked `flat: false`, both tools apply the top marginal rate to the
entire allocated/sourced amount, which overstates liability for any amount that
wouldn't actually reach that state's top bracket. Two options to present to the tax
team, don't pick one unilaterally:

1. Keep top-marginal rate as an intentional, labeled conservative ceiling ("worst-case
   estimate") — cheapest to build, currently what's shipped, just needs honest labeling.
2. Build real bracket tables for non-flat states — more accurate, meaningfully more
   data-maintenance burden (per the existing D2 vendor discussion in the handoff doc).

Whatever the current tool ships, update the label from implying precision to explicitly
saying whether it's a ceiling or a bracket-accurate number.

### 7.3 QBI — P1 for a warning banner, P2/needs sign-off for real phase-out math

Don't implement full §199A phase-in/phase-out/SSTB logic without the tax team handing
over the ruleset (already blocker #2/#3 in `docs/PHASE-1-HANDOFF.md`). What *can* ship
now without sign-off, because it's a flag rather than a formula:

```tsx
{hasEntity && result.grossIncome > SSTB_WARNING_THRESHOLD && (
  <div className="border-l-2 border-accent pl-4 py-3 bg-mist/40">
    <div className="eyebrow text-accent">QBI may not apply at this income level</div>
    <p className="mt-2 text-sm text-ink">
      Personal endorsement income is very likely a "specified service trade or
      business" under §199A. At this income level the real QBI deduction may be
      partially or fully phased out regardless of entity structure. The flat 20%
      shown here is a simplified placeholder — route to the tax team before using
      this number to justify an entity election.
    </p>
  </div>
)}
```

`SSTB_WARNING_THRESHOLD` — use a clearly-commented placeholder constant near the top
of the federal bracket range as a rough trigger point; get the tax team to confirm the
real number rather than treating the placeholder as authoritative.

### 7.4 Kiddie-tax "unearned income" bucket — P1 code flag, **needs tax-team sign-off**

Current code:

```ts
const unearned = nilNonCash + scholarshipTaxable;
```

`nilNonCash` is treated as earned/business income everywhere else in the same
calculation (it flows into `netSelfEmployment` and is subject to SE tax). Using it
again as "unearned" for the kiddie-tax check is internally inconsistent and may be
wrong either way. Don't resolve this by guessing. Minimum viable fix: split it out
and comment the open question explicitly:

```ts
// OPEN QUESTION (tax team): does in-kind NIL compensation to a minor count as earned
// (business) income or unearned income for kiddie-tax purposes? Currently only
// scholarshipTaxable is counted as unearned pending that answer. See
// docs/TAX-CALCULATOR-ACCURACY-GUIDE.md section 7.4.
const unearned = scholarshipTaxable;
```

This is a narrower, more defensible default than the current one — don't expand it
back to include `nilNonCash` without an explicit answer.

### 7.5 Safe-harbor anchor — P2, make it configurable, **needs firm policy decision**

Already tracked as `docs/PHASE-1-HANDOFF.md` item B2. The only code work needed now is
to stop hardcoding `SAFE_HARBOR_CURRENT_YEAR_PCT` as *the* method and make it a
switchable config so wiring in the firm's actual policy later is a one-line change,
not a rewrite:

```ts
export type SafeHarborMethod =
  | { kind: "currentYear"; pct: 0.9 }
  | { kind: "priorYear"; pctUnder150k: 1.0; pctOver150k: 1.10 };

export const SAFE_HARBOR_METHOD: SafeHarborMethod = { kind: "currentYear", pct: 0.9 }; // placeholder pending firm policy
```

Update the quarterly-payment calc in Tool C to branch on this. No UI copy change needed
beyond making sure whichever method is active is clearly labeled (it already is).

### 7.6 Local/municipal income tax — P3, document only

Ohio/Kentucky/Alabama-style municipal occupational taxes aren't modeled anywhere.
Out of scope for this pass — add one line to both tools' footer disclaimers noting
local taxes aren't included, so it's an honest known-limitation rather than a silent
gap.

### 7.7 Nonresident filing threshold — P0, follows from section 3

Once per-deal sourcing exists, re-key the "file flag" off `awayStateTotals` from
`summarizeSourcing()` instead of duty-day-allocated income:

```ts
const nonresidentFile = (state: string, amount: number) =>
  state !== homeState && amount > rateFor(state).filingThreshold && rateFor(state).filingThreshold > 0;
```

---

## 8. UI/copy checklist

- [ ] `/intake/contracts`: add a "Where was this deal's work performed?" state
      selector on the contract form, defaulting to blank (not silently pre-filled with
      home state), with helper text distinguishing it from the athlete's team/schedule:
      *"Not where you play — where this specific deal happened (shoot location,
      appearance city, etc.)."* Wire to `workState` / `workStateConfirmed`.
- [ ] `/tools/consolidated-tax`: replace single state-tax tile with home/away
      breakdown table; surface `needsReview` contracts; fix the "reconciles with
      jock-tax" footer claim.
- [ ] `/tools/jock-tax`: remove from default nav (`app/advisor/[id]/page.tsx`,
      `app/intake/page.tsx`) per section 6, or relabel if/when revenue-share income
      ships.
- [ ] `app/advisor/[id]/page.tsx`: the "Competing states" panel currently implies it's
      driven by the game schedule. If Tool A is being de-emphasized, consider whether
      this panel should instead reflect states where the athlete has *deal* exposure
      (i.e., driven by `workState` across contracts) — flag to Brody, don't change
      silently since it's user-facing framing, not just a calculation.
- [ ] Every new/changed tax output keeps the existing **"Estimate for planning
      purposes — not a filed return"** label. Don't drop it anywhere.

---

## 9. Test scenarios to verify against

Write these as fixtures/tests, not just manual spot-checks:

1. **Single home-state athlete, no away deals.** All contracts have `workState` blank
   or equal to home state. Expect: `awayStateTotals` empty, `stateTax` equals simple
   home-state calc, no credit applied.
2. **One away-state deal.** One $50K contract with `workState` ≠ home state. Expect:
   away-state tax computed on that $50K, home-state credit applied up to home gross
   liability, total reflects both.
3. **Multiple deals, multiple away states.** Verify per-state totals aggregate
   correctly and the credit caps at home-state gross liability (doesn't go negative).
4. **Unconfirmed work state.** Contract with `workState` set but `workStateConfirmed:
   false`. Expect it still sources correctly but appears in `needsReview` and renders
   the review flag in the UI.
5. **No-income-tax home state (e.g., FL, TX).** Away-state tax should NOT be offset by
   any credit (home gross liability is $0), so away-state tax flows straight through
   to the total — verify this doesn't silently zero out.
6. **Kiddie-tax flag still fires correctly** after the section 7.4 change, using only
   `scholarshipTaxable` as the unearned figure — confirm the threshold check itself
   (`> KIDDIE_TAX_UNEARNED_THRESHOLD_2024`) is unchanged, only the input to it.

---

## 10. Explicit non-goals for this pass

Don't do these without an explicit go-ahead — they're either sign-off-gated or
out of scope:

- Full 50-state bracket tables (section 7.2) — placeholder/ceiling approach stays
  until the tax team picks a direction.
- Full §199A QBI phase-out/SSTB calculation (section 7.3) — banner only, not a formula.
- Switching the safe-harbor default (section 7.5) — make it configurable, don't flip it.
- Local/municipal tax modeling (section 7.6).
- Multi-location `ContractLocation` table — single `workState` per contract is enough
  for this pass.
- Deleting any part of the Jock Tax tool's duty-day math (section 6) — repurpose only.
- Anything that removes or waters down the "Estimate for planning purposes" label, the
  advisor-override logging, or the "ambiguous cases flag for review" behavior — these
  are standing governance rules from `CLAUDE.md`, not up for revision here.

---

## 11. Open items to route to humans, not the coding agent

- Revenue-share income: in scope or not? (Decides section 6's endpoint.)
- State standard-deduction data source (section 7.1) and bracket-vs-ceiling decision
  (section 7.2) — both already tracked under `docs/PHASE-1-HANDOFF.md` item D2; this
  guide just points the resulting data at the specific fields listed above once decided.
- SSTB/QBI ruleset and safe-harbor firm policy — already tracked as
  `docs/PHASE-1-HANDOFF.md` items B2/B3.
- Kiddie-tax unearned-income classification for in-kind NIL comp (section 7.4) — new
  item, not previously called out by name in the handoff doc; worth adding there too.

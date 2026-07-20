# Game Plan Action — Phase 1 handoff

**Audience:** Brody (product owner) + the folks he'll route items to at Cerity.
**Purpose:** everything I can't decide from the code side. Every item below is a
blocker on some part of what actually ships.

Grouped so Brody can forward each section to the right owner.

---

## A. eMoney account team (Cerity's existing rep)

The single most important unlock. Everything about the plan output depends on it,
and onboarding is measured in **weeks** because of the certificate procurement.

1. **Upgrade Cerity's eMoney contract to the Expanded Planning tier.** Core +
   Planning aren't enough. Expanded Planning is what unlocks read/write on all
   Facts collections plus higher Monte Carlo throughput. Cerity already pays
   for eMoney — this is a SKU change, not a new vendor relationship.

2. **Provision developer portal access** at `developer.emoneyadvisor.com` for
   two named engineers (Test + Prod), and issue the two **externally CA-signed
   X.509 client certificates** required for the JWT client-assertion flow.

3. **Answer one specific open question**: what are the valid enum values for
   the `type` field on Expense records (both the `isGoal: true` goal case and
   the `isGoal: false` operating-expense case)? These live behind the gated
   OpenAPI reference on the portal — we need the exact strings before the
   export payload can be finalized. Right now every `type` field in
   `lib/emoney-export.ts` is `"UNKNOWN__PENDING_EMONEY_PORTAL_ACCESS"`.

4. **Confirm the Vault upload endpoint contract.** We want to mirror the
   original PDF of every NIL contract into eMoney's Client Vault alongside
   the structured data we extract. Need the endpoint, size limits, and the
   ACL model (advisor-only vs. client-visible).

5. **Confirm native Schwab / Fidelity aggregation for Cerity's plan tier.**
   We're planning to skip a custom investment-statement PDF parser in favor
   of piggybacking on eMoney's aggregation. Verify it's on for Cerity's
   contract and that new athlete accounts get it out of the box.

**Fallbacks if the eMoney conversation stalls:** `advisorsales@emoneyadvisor.com`,
1-888-362-4612, or the developer-portal "Contact us" form. Prefer the existing
account rep — the sales channel is slower.

**Kick this off now. Everything else can happen in parallel.**

---

## B. Firm's tax team (formulas & sign-off)

The calculators run today with defensible formulas but every one of them needs
tax-team sign-off before it's put in front of a real client. Nothing on this
list is a code change — it's a specialist review.

1. **Duty-day formula.** Currently game day ± 1 (dedupe by state/day) +
   optional preseason start date from the athlete + any additional away
   days the athlete reports (bowl, media day, brand trip). Compare against
   the fuller "all business days" methodology used at higher income levels.
   Sign off on the simplified version for NIL income ranges, or tell us to
   move to the fuller model.

2. **Safe-harbor percentage for quarterly estimated payments.** Tool C
   defaults to **90% of current-year estimated liability**. Prior-year is
   the other common anchor (100% under $150K AGI, 110% over). Pick the
   firm's default policy so we can wire it in.

3. **QBI mechanics.** Tool C applies a flat 20% deduction when the entity
   flag is on. Real QBI has phase-in / phase-out at income thresholds,
   W-2 wage limits, and SSTB exclusions. Sign off on the simplified calc
   for NIL income ranges, or hand us the full ruleset.

4. **Home-state credit logic.** Tool A currently credits away-state tax
   dollar-for-dollar against home-state liability, capped at home-state
   gross. Real credits vary state to state (some limit to the lower of the
   two rates). Confirm the aggressive approach is fine for planning
   estimates, or provide a per-state override table.

5. **Scholarship taxable / non-taxable split.** We currently ask for the
   taxable portion as a single input. Split methodology — tuition + fees +
   required books = non-taxable, room / board / stipend = taxable — matches
   standard IRS treatment. Confirm this is how the firm wants to model it,
   or give us a variant.

6. **Kiddie-tax handling.** Tool C flags it when a minor claimed as a
   dependent has unearned income over the 2024 threshold ($2,600). What's
   the escalation path — route to the parents' preparer, require a parent
   return upload, something else? The flag exists but doesn't route yet.

7. **Nonresident filing thresholds by state.** These are hardcoded from a
   snapshot in `content/tax.ts`. See section D on the data-source decision.

---

## C. Compliance / legal review

1. **Minor / custodial account handling.** Under-18 athletes route through a
   UTMA/UGMA structure with parent co-access. Compliance review the full
   flow before we allow a real minor through it: guardian verification,
   custodial state selection (state of minor's residence vs. state of
   sponsoring adult), and record retention.

2. **NIL contract storage.** We want to Vault-mirror executed contracts.
   Confirm we're allowed to hold executed NIL contracts server-side (Neon
   Postgres + eMoney Vault). Retention period? Deletion request handling?

3. **Client-facing tax numbers — sign-off requirement.** Every output ships
   with the "Estimate for planning purposes — not a filed return" label.
   Is that sufficient by itself, or does a real client seeing a number
   require a separate advisor-reviewed CTA ("Reviewed by [advisor name]
   on [date]")? Affects the UI flow, not just the label.

4. **Named sign-off owner for flagged / ambiguous cases.** Tool A flags
   domicile ambiguity; Tool C flags kiddie-tax risk; the compliance
   surface flags multi-state edge cases. Who is the named human that
   reviews these before a client sees the resulting number? Rotating
   advisors, a specific tax lead, or a queue routed to whoever picks it up?
   The flag exists — the reviewer assignment doesn't.

---

## D. Vendor decisions (Brody + engineering)

Each of these is a "pick one, sign the contract, wire the integration"
decision. Rough recommendations included; final call is yours.

### D1. Schedule API (~$10/month total)

- **Football + men's basketball**: CollegeFootballData API +
  CollegeBasketballData API, both from the same maintainer on the same
  **Patreon Tier 3 at $10/month** subscription (75,000 calls, GraphQL,
  realtime). Venue records include city / state — everything we need to
  derive tax jurisdiction. Recommended.
- **Women's basketball**: same CBD API *if* WBB coverage is deep enough
  across all ~350 D1 programs. Needs a small spike script to verify — try
  fetching a full-season schedule for a handful of WBB programs and
  confirm every game has venue city/state.
- **Fallback for women's basketball**: ESPN's undocumented
  `womens-college-basketball/scoreboard` endpoint (free, no key, same
  shape as MBB). Women's D1 is genuinely underserved commercially —
  SportRadar and SportsDataIO cover it but are 4-figure/month enterprise
  contracts.
- **Gotcha to flag before signing**: CFBD/CBD are Patreon-funded hobbyist
  projects with no commercial SLA. Fine for an internal advisor tool;
  review their ToS before real client-facing use, and keep the ESPN
  scoreboard warm as a bus-factor fallback.

### D2. State tax rate feed

- **Year one (recommended): hybrid, no commercial contract.**
  - Seed `content/tax.ts` from the Tax Foundation's annual XLSX (top
    rates + brackets, machine-parseable, refreshed each February).
  - Hand-maintain a small JSON of nonresident thresholds + reciprocity
    flags (~200 rows total, changes rarely) with quarterly review.
  - Add an "as-of" date field on every rate and surface it in the UI
    next to the existing planning-estimate label.
- **Upgrade path when the Override audit log shows the snapshot is the
  bottleneck**: CCH AnswerConnect API (~$25K+/yr) is the RIA/CPA
  default. Before signing anything new, check whether Cerity already
  has a firm-wide **Thomson Reuters Checkpoint** subscription — if
  yes, that's the natural upgrade with no new vendor.
- **Explicitly not viable**: scraping 51 DOR pages (0.25–0.5 FTE
  maintenance burden) and TaxJar / Avalara (both sales tax only).

### D3. LLM for contract extraction

- Anthropic Claude and OpenAI GPT-4 are both fine at contract term
  extraction with a well-scoped prompt; pick one.
- Both need the same conversation with compliance about what data can
  be sent server-side (see C.2). Server-only, never in the client bundle.
- Not a Phase 1 blocker — the contract form works fine as manual entry
  today; extraction is a nice-to-have Phase 1.5 upgrade.

### D4. Tax return upload — Holistiplan?

- Cerity may already have a Holistiplan relationship. Confirm before we
  build a custom PDF parser for tax returns.

### D5. Investment statements — piggyback on eMoney aggregation

- Same recommendation as A.5 — skip custom parsers, use eMoney's native
  Schwab / Fidelity aggregation. This is technically part of the eMoney
  Expanded Planning conversation.

---

## E. Product decisions (Brody / firm)

Small but blocking. Pick a number and I'll wire it in.

1. **Entity structure flag threshold.** NIL income above $X flips the
   advisor prompt to discuss LLC / S-corp election. What's X? Common
   heuristics land in the $50K–$150K range depending on the firm.

2. **Disability / loss-of-value insurance flag threshold.** NIL income
   above $Y flips the advisor prompt to discuss LOV insurance. Same
   question. Common heuristics land higher — often $250K+ projected annual.

3. **Advisor visibility scope.** The current build shows every athlete
   on Cerity's book to every advisor account. Outline said team-wide.
   Confirm before Phase 1 so we don't have to unwind it later. If
   assigned-only becomes a requirement, it's a real amount of work.

4. **Transfer portal flow.** Phase 1 or Phase 2? "Update my team" that
   re-runs team selection + re-themes the home while preserving past
   schedule / tax data is a meaningful chunk of work.

5. **Client-visible NIL rules or advisor-only?** The state NIL
   compliance surface at `/tools/state-nil` is client-visible right now
   (as the outline said). Confirm.

---

## F. IT (Cerity)

1. **SSO via Cerity email** (Google Workspace or Azure AD?) — need to
   plan the handoff before the credentials-only auth is retired.

2. **Data security review on Vercel + Neon Postgres** before real
   client data is stored. Neon has SOC 2 Type II; Cerity may still want
   a signed DPA-style agreement. Confirm the region (US-East vs. US-West)
   the firm requires.

3. **Backup and audit-log retention policy.** How long, and where.

---

## G. Content still needed

Small but they gate real usage:

1. **Full NCAA D1 school list.** `content/teams.ts` has ~135 schools
   right now; production wants the full D1 roster (~360 programs across
   all men's / women's D1 basketball). Not blocking prototype demos; is
   blocking real onboarding.

2. **Expense form line items — one-pass review.** Outline listed 21
   specific line items; those are all coded in `content/expense-lines.ts`
   at `/intake/expenses`. Brody or the tax team should walk the list
   once and confirm nothing is missing before the first real athlete
   fills it out.

3. **State NIL compliance real content.** The scaffold at
   `content/nil-compliance.ts` has an entry for every state + DC, but
   the `keyPoints` field on most is a "counsel review required"
   placeholder. This is where the compliance data source conversation
   (section A / C) matters most — we can't populate real rules without
   a source.

---

## Suggested next actions for Brody (in order of impact)

1. **Send the eMoney account rep a note today** — start the Expanded
   Planning + certificate provisioning conversation. This is the longest
   pole in the tent.
2. Route section B (formulas) to the firm's tax lead.
3. Route section C (compliance) to whoever owns compliance at Cerity.
4. Get IT looped in on section F.
5. Make the vendor decisions in D — a $10 Patreon subscription today
   unblocks schedule integration next week.
6. Give me numbers for E.1, E.2 and the answers to E.3, E.4, E.5 —
   these are 15-minute product decisions that let me wire flag logic.

**Everything else in the tool can keep building in parallel to these
conversations.** The eMoney conversation is the only true blocker on
Phase 1 shipping — every other section either has a code-level fallback
already in place, or gates only a specific subfeature.

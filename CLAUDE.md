# Game Plan Action — Agent Working Notes

Internal advisor tool for Cerity Partners' athlete division. Companion to the public
Game Plan marketing site (`gameplan` repo). This site is NOT client-facing marketing —
it's the tool advisors use once an NIL athlete is (near) a client.

## Stack
Next.js 14 App Router · TypeScript · Tailwind · Framer Motion. Same visual system as
`gameplan` — navy `#1D2532`, eggshell `#F2EDE4`, gold `#D9CAB8`, bronze accent
`#8C7758`, Source Serif 4 display + Inter body.

## Governance rules (must ship day-one)
- Every tax output carries the persistent label:
  **"Estimate for planning purposes — not a filed return."**
- All state tax rates in `content/tax.ts` are PLACEHOLDERS. Real build pulls from a
  maintained external feed at calculation time.
- Duty-day formula, safe-harbor %, QBI mechanics: pending tax-team sign-off. Do not
  change formulas without noting the reviewer.
- Ambiguous domicile / multi-state cases must be flagged for advisor review, not
  silently inferred.
- Advisor overrides on tool outputs should be logged (what changed, why) — this is
  the accuracy feedback loop.
- Every field must be editable by either the client or the advisor. No read-only-for-
  client traps once an advisor has touched a record.

## Phase 1 blockers (flag to Brody, not attempts to solve in code)
1. eMoney API / sandbox access via Cerity's eMoney relationship owner.
2. Tax team sign-off on duty-day formula, safe-harbor %, QBI.
3. Source-of-truth for live state tax rates + reciprocity + filing thresholds.
4. Named sign-off owner for flagged / ambiguous tax estimates.
5. State NIL compliance data source + refresh cadence.
6. Dollar thresholds for entity-structure and disability/LOV insurance flags.
7. Compliance review for minor / custodial handling.
8. Basketball schedule API availability.

## Current shape of this repo
- `/` — landing / kickoff summary
- `/advisor` — roster (mocked) with status + flag columns
- `/advisor/[id]` — athlete drill-in with tool cards
- `/intake` — client intake flow: intro → basics → sport → team → pin drop → themed home
- `/intake/goals` — Goals Module (short / medium / long-term, plug-and-fill)
- `/tools/jock-tax` — Jock Tax Calculator with duty-day + questionnaire + home-state credit

All data is mocked (`content/roster.ts`, `content/teams.ts`, `content/tax.ts`).
Phase 1 build wires Prisma + auth + real schedule + real rate feed.

## Commands
`npm install && npm run dev` — local. `npm run build` — prod build.

# Game Plan Action — Agent Working Notes

Internal advisor tool for Cerity Partners' athlete division. Companion to the public
Game Plan marketing site (`gameplan` repo). This site is NOT client-facing marketing —
it's the tool advisors use once an NIL athlete is (near) a client.

## Stack
Next.js 14 App Router · TypeScript · Tailwind · Framer Motion · Prisma + Postgres ·
credentials auth (bcrypt + JWT cookies via jose). Same visual system as `gameplan` —
navy `#1D2532`, eggshell `#F2EDE4`, gold `#D9CAB8`, bronze accent `#8C7758`,
Source Serif 4 display + Inter body.

## Governance rules (must ship day-one)
- Every tax output carries the persistent label:
  **"Estimate for planning purposes — not a filed return."**
- All state tax rates in `content/tax.ts` are a 2024/2025 snapshot. Real build pulls
  from a maintained external feed (state DOR data or licensed provider) at calculation
  time.
- Duty-day formula, safe-harbor %, QBI mechanics: pending tax-team sign-off. Do not
  change formulas without noting the reviewer.
- Ambiguous domicile / multi-state cases must be flagged for advisor review, not
  silently inferred.
- Advisor overrides on tool outputs are logged to the `Override` table (what
  changed, why) — this is the accuracy feedback loop.
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
- `/signup`, `/login`, `/dashboard` — credentials auth (Client or Advisor role)
- `/advisor` — roster from Postgres (falls back to `content/roster.ts` mock if DB empty)
- `/advisor/[id]` — athlete drill-in with tool cards
- `/intake` — client intake flow: intro → basics → sport → team (visual conference grid,
  filtered by chosen sport) → pin drop → themed home
- `/intake/goals` — Goals Module, persisted to DB via server actions
- `/tools/jock-tax` — Jock Tax Calculator with duty-day + questionnaire + home-state credit
- `/tools/consolidated-tax` — federal + SE + state reconciliation, QBI, kiddie tax flag

Data: `content/teams.ts` (every FBS football school + power basketball conferences with
primary/accent colors), `content/tax.ts` (all 50 + DC top marginal rates, 2024 federal
brackets, SE base, kiddie tax + safe-harbor thresholds, plus federalTax / seTax helpers),
`content/roster.ts` (fallback mock only).

## Commands
```
npm install               # installs deps + runs prisma generate
cp .env.example .env      # set DATABASE_URL and AUTH_SECRET
npx prisma db push        # create the schema in your DB
npm run db:seed           # optional demo data (advisor + 8 athletes)
npm run dev
```
Seeded logins: `advisor@cerity.example` / `gameplan!` and
`marcus.ellison@example.com` / `gameplan!` (any of the 8 seeded clients).

## Vercel
`vercel.json` runs `prisma generate && prisma db push` on every deploy so schema stays in
sync. Required env vars: `DATABASE_URL`, `AUTH_SECRET`. See README for full setup.

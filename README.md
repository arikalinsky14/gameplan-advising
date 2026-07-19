# Game Plan Action

Internal advisor tool for Cerity Partners' athlete division. Companion to the
public Game Plan marketing site. See `CLAUDE.md` for governance rules and the
list of hard blockers to resolve before Phase 1 ships.

## Stack

- Next.js 14 (App Router, TypeScript) · Tailwind · Framer Motion
- Prisma + PostgreSQL
- Credentials auth via bcrypt + JWT cookies (no external auth provider)
- Same visual system as the marketing site (`gameplan` repo)

## What's here

Routes:

- `/` — kickoff summary + Phase 1 scope
- `/signup`, `/login` — account creation (Client or Advisor role)
- `/dashboard` — routes each role to the right landing page
- `/advisor` — full roster (from DB, with mock fallback if DB empty)
- `/advisor/[id]` — athlete drill-in with tool cards
- `/intake` — client flow: intro → basics → sport → team (visual conference grid) → pin-drop → themed home
- `/intake/goals` — Goals Module (persisted to DB)
- `/tools/jock-tax` — duty-day allocation + refinement questionnaire + home-state credit
- `/tools/consolidated-tax` — federal + SE + state reconciliation, QBI, kiddie tax flag

## Data

- `content/teams.ts` — every FBS football school + power basketball conferences (Big East, Ivy, A-10, WCC, etc.), grouped by conference, with primary/accent team colors used for the school-themed home
- `content/tax.ts` — 2024/2025 top marginal state income tax rates for all 50 states + DC, plus 2024 federal brackets, SE tax base, kiddie-tax and safe-harbor thresholds. Still a snapshot — production must swap for a live feed (see `CLAUDE.md` blocker #3)
- `content/roster.ts` — mock roster used as the fallback when the DB is empty

## Local development

Prerequisites: Node 18+, a Postgres 15+ database (Docker, Neon, Supabase, or Vercel Postgres).

```bash
cp .env.example .env
# edit .env with DATABASE_URL and AUTH_SECRET

npm install
npx prisma db push       # creates the schema in your DB
npm run db:seed          # optional — populates advisor + 8 client athletes
npm run dev              # http://localhost:3000
```

Seeded logins:

- Advisor · `advisor@cerity.example` / `gameplan!`
- Client (any of the 8): e.g. `marcus.ellison@example.com` / `gameplan!`

## Deploying to Vercel

1. Push this repo to GitHub, then import into Vercel.
2. Add a Postgres database:
   - Easiest: Vercel Postgres (Storage → Create → Postgres). It writes `DATABASE_URL` automatically.
   - Alternative: [Neon](https://neon.tech) free tier — create a project, copy the connection string, paste into a Vercel `DATABASE_URL` env var.
3. Add `AUTH_SECRET`:
   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```
   Paste that value into the `AUTH_SECRET` Vercel env var.
4. Deploy. `vercel.json` runs `prisma generate && prisma db push` on every build so
   schema changes land automatically.
5. First deploy: run `npm run db:seed` locally (against the same `DATABASE_URL`) to
   populate the demo advisor and roster. Or skip — new signups work fine on an
   empty DB, and the advisor screen falls back to the mock roster.

## Governance (don't ship without)

Repeated from `CLAUDE.md` for visibility:

- Every tax output carries **"Estimate for planning purposes — not a filed return."**
- State rates in `content/tax.ts` are a snapshot, not a live feed.
- Duty-day formula, safe-harbor %, and QBI mechanics pending tax-team sign-off.
- Ambiguous domicile / multi-state cases must be flagged for advisor review.
- Advisor overrides on tool outputs are logged (`Override` table) — this is the
  accuracy feedback loop for the calculators.

## Phase 1 blockers (flag to Brody; not solved in code)

1. eMoney API / sandbox access via Cerity's eMoney relationship owner.
2. Tax team sign-off on duty-day formula, safe-harbor %, QBI.
3. Source-of-truth for live state tax rates + reciprocity + filing thresholds.
4. Named sign-off owner for flagged / ambiguous tax estimates.
5. State NIL compliance data source + refresh cadence.
6. Dollar thresholds for entity-structure and disability/LOV insurance flags.
7. Compliance review for minor / custodial handling.
8. Basketball schedule API availability.

## Data model

See `prisma/schema.prisma`. Highlights:

- `User` — one login, `role: ADVISOR | CLIENT | GUARDIAN`
- `Athlete` — the intake record, owned 1:1 by a Client user; `GuardianAccess`
  join table for parent/guardian co-access
- `Goal`, `Contract`, `Expense`, `TaxSnapshot` — related records feeding the eMoney export
- `Override` — advisor-edit audit log

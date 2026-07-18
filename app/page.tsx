import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import NumberedSection from "@/components/NumberedSection";
import { CerityMark } from "@/components/CerityLogo";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[88vh] flex items-center bg-paper overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 md:-right-12 md:-bottom-12 opacity-[0.08]"
        >
          <CerityMark className="w-[820px] h-[820px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-12 gap-10 w-full relative">
          <div className="md:col-span-9">
            <ScrollReveal delay={0.05}>
              <div className="eyebrow">Internal · Advisor tool</div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="display text-5xl md:text-8xl mt-8 text-ink">
                Game Plan <span className="text-accent">Action.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.18}>
              <p className="mt-8 text-xl md:text-2xl text-slate max-w-2xl leading-snug">
                Turn a first conversation with an NIL athlete into an eMoney-ready plan in one
                sitting. Intake, tax, and NIL tools built specifically for high school and
                college athletes.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.24}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/advisor"
                  className="rounded-full bg-ink text-paper px-6 py-3 text-sm hover:bg-accent transition"
                >
                  Open advisor dashboard →
                </Link>
                <Link
                  href="/intake"
                  className="rounded-full border border-ink/20 px-6 py-3 text-sm hover:bg-ink hover:text-paper transition"
                >
                  Start client intake
                </Link>
                <Link
                  href="/tools/jock-tax"
                  className="rounded-full border border-ink/20 px-6 py-3 text-sm hover:bg-ink hover:text-paper transition"
                >
                  Jock tax calculator
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <NumberedSection index={1} eyebrow="What this is" title="The internal companion to Game Plan.">
        <p>
          Game Plan (Information) markets Cerity Partners to prospective athlete clients. Game
          Plan Action is what advisors use once an athlete becomes — or is close to becoming —
          a client. It takes in income, expenses, tax exposure, and liabilities, and produces a
          structured financial plan output formatted for direct entry into eMoney.
        </p>
        <p>
          Scope for Phase 1: high school and college NIL athletes only. Professional athletes are
          a separate, future workstream.
        </p>
      </NumberedSection>

      <NumberedSection index={2} eyebrow="Who uses it" title="Client screen, advisor screen, joint mode.">
        <p>
          <span className="text-ink font-medium">Clients</span> — the athlete or a
          parent/guardian — complete a mobile-friendly intake for their own account only.
          Minors trigger a custodial (UTMA/UGMA) structure and parent co-access.
        </p>
        <p>
          <span className="text-ink font-medium">Advisors</span> see the full roster with status
          and flag indicators at a glance, and can drill into and edit any field on any
          account.
        </p>
        <p>
          The tool supports three fill-out patterns: client self-service, advisor-completed,
          and joint (advisor + client working through it together). No read-only traps — every
          field is editable by either role.
        </p>
      </NumberedSection>

      <NumberedSection index={3} eyebrow="Phase 1 tools" title="What ships in the first build.">
        <ul className="list-disc pl-6 space-y-2">
          <li>Client intake shell — basic info, sport, Tier 1 team selection, themed home.</li>
          <li>Goals Module — short / medium / long-term, plug-and-fill.</li>
          <li>Jock Tax Calculator — duty-day allocation over live schedule and state rates.</li>
          <li>Contract & payment extraction — NIL deal terms in, structured record out.</li>
          <li>Consolidated tax calculator — federal + SE + state reconciliation.</li>
          <li>State NIL compliance surface — lookup table for every state the athlete touches.</li>
          <li>General wealth intake — document upload + Expense Form + guided entry.</li>
          <li>Advisor roster with drill-in and flag columns.</li>
          <li>Structured eMoney Facts export for manual entry at launch.</li>
        </ul>
        <p className="text-sm">
          Every tax output ships with the persistent label:{" "}
          <span className="italic text-ink">
            &ldquo;Estimate for planning purposes — not a filed return.&rdquo;
          </span>
        </p>
      </NumberedSection>

      <NumberedSection index={4} eyebrow="Blockers" title="What has to unblock before Phase 1 ships.">
        <ul className="list-disc pl-6 space-y-2">
          <li>eMoney API / sandbox access — via Cerity&rsquo;s eMoney relationship owner.</li>
          <li>Tax team sign-off on duty-day formula, safe-harbor %, and QBI mechanics.</li>
          <li>Source-of-truth for live state tax rates, reciprocity, filing thresholds.</li>
          <li>Named sign-off owner for flagged / ambiguous tax estimates.</li>
          <li>State NIL compliance data source + refresh cadence.</li>
          <li>Dollar thresholds for entity-structure and loss-of-value insurance flags.</li>
          <li>Compliance review for minor / custodial handling.</li>
          <li>Basketball schedule API availability.</li>
        </ul>
      </NumberedSection>
    </>
  );
}

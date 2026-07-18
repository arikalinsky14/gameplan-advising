import Link from "next/link";
import { notFound } from "next/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import { ROSTER, STATUS_LABEL, FLAG_LABEL } from "@/content/roster";

export function generateStaticParams() {
  return ROSTER.map((a) => ({ id: a.id }));
}

export default function AthleteDetail({ params }: { params: { id: string } }) {
  const athlete = ROSTER.find((a) => a.id === params.id);
  if (!athlete) notFound();

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <Link href="/advisor" className="eyebrow hover:text-accent">
            ← Roster
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <h1 className="display text-5xl md:text-7xl text-ink">{athlete.name}</h1>
            <div className="text-slate">
              {athlete.sport} · {athlete.school} · {athlete.classYear}
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-8 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-ink text-paper px-3 py-1 text-[11px] uppercase tracking-wider">
            {STATUS_LABEL[athlete.status]}
          </span>
          {athlete.isMinor && (
            <span className="inline-flex items-center rounded-full bg-gold text-ink px-3 py-1 text-[11px] uppercase tracking-wider">
              Minor · UTMA / co-access
            </span>
          )}
          {athlete.flags.map((f) => (
            <span
              key={f}
              className="inline-flex items-center rounded-sm border border-accent/50 text-accent text-[11px] px-2 py-1"
            >
              {FLAG_LABEL[f]}
            </span>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <Panel title="NIL income (YTD)">
            <div className="display text-4xl text-ink tabular-nums">
              ${athlete.nilIncomeYtd.toLocaleString()}
            </div>
            <p className="mt-2 text-xs text-slate italic">
              Gross. Net-to-athlete after agent/rep fees populates from Contract Extraction (Tool B).
            </p>
          </Panel>
          <Panel title="Home state">
            <div className="display text-4xl text-ink">{athlete.homeState}</div>
            <p className="mt-2 text-xs text-slate">
              Domicile — asked directly, not inferred from address.
            </p>
          </Panel>
          <Panel title="Competing states">
            <div className="flex flex-wrap gap-2">
              {athlete.competingStates.map((s) => (
                <span key={s} className="inline-flex items-center rounded-sm bg-mist text-ink text-xs px-2 py-1 tabular-nums">
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate">
              Feeds jock tax and state NIL compliance surface.
            </p>
          </Panel>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <ToolCard
            eyebrow="Section 7 · A"
            title="Jock Tax Calculator"
            blurb="Duty-day allocation over the live schedule + current state rates. Home-state credit applied."
            href="/tools/jock-tax"
            cta="Open calculator"
          />
          <ToolCard
            eyebrow="Section 7 · B"
            title="Contract & Payment Extraction"
            blurb="Drag-drop NIL contracts. Structured deal record out — amount, schedule, exclusivity, non-cash comp, agent fee %."
            href="#"
            cta="Coming in Phase 1 build"
            disabled
          />
          <ToolCard
            eyebrow="Section 7 · C"
            title="Consolidated Tax Calculator"
            blurb="Federal + SE + state reconciliation. Kiddie-tax check for minors. QBI when entity exists."
            href="#"
            cta="Coming in Phase 1 build"
            disabled
          />
          <ToolCard
            eyebrow="Section 8"
            title="Goals Module"
            blurb="Short / medium / long-term goals. Maps 1:1 to eMoney expense records with isGoal: true."
            href="/intake/goals"
            cta="Open goals"
          />
          <ToolCard
            eyebrow="Section 9-B"
            title="Expense Form"
            blurb="Downloadable branded spreadsheet. Standard + athlete-specific line items. Upload back for extraction."
            href="#"
            cta="Coming in Phase 1 build"
            disabled
          />
          <ToolCard
            eyebrow="Section 10"
            title="Export to eMoney"
            blurb="Structured Facts payload — Income, Expenses, Goals (isGoal: true), Assets/Liabilities, Advisor notes."
            href="#"
            cta="Manual export CSV/JSON — pending API access"
            disabled
          />
        </div>

        <p className="mt-16 text-xs text-slate italic">
          Every override an advisor makes on this account will be logged (what changed, why).
          That&rsquo;s the accuracy feedback loop for the calculators.
        </p>
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line rounded-sm p-6 bg-paper">
      <div className="eyebrow">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ToolCard({
  eyebrow,
  title,
  blurb,
  href,
  cta,
  disabled,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  href: string;
  cta: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className={`h-full border border-line rounded-sm p-6 bg-paper transition ${
        disabled ? "opacity-60" : "hover:border-accent hover:bg-mist/40"
      }`}
    >
      <div className="eyebrow">{eyebrow}</div>
      <h3 className="display text-2xl mt-3 text-ink">{title}</h3>
      <p className="mt-3 text-slate text-sm leading-relaxed">{blurb}</p>
      <div className="mt-6 text-sm text-accent">{cta} {!disabled && "→"}</div>
    </div>
  );
  return disabled ? inner : <Link href={href}>{inner}</Link>;
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ROSTER as MOCK_ROSTER, STATUS_LABEL, FLAG_LABEL } from "@/content/roster";

export const dynamic = "force-dynamic";

type Athlete = {
  id: string;
  name: string;
  sport: string;
  school: string;
  classYear: string;
  isMinor: boolean;
  status: keyof typeof STATUS_LABEL;
  flags: (keyof typeof FLAG_LABEL)[];
  nilIncomeYtd: number;
  homeState: string;
  competingStates: string[];
};

const STATUS_MAP: Record<string, Athlete["status"]> = {
  NOT_STARTED: "not-started",
  IN_PROGRESS: "in-progress",
  PLAN_GENERATED: "plan-generated",
  SYNCED_TO_EMONEY: "synced-to-emoney",
};

async function loadAthlete(id: string): Promise<Athlete | null> {
  try {
    const a = await prisma.athlete.findUnique({ where: { id } });
    if (a) {
      return {
        id: a.id,
        name: [a.firstName, a.lastName].filter(Boolean).join(" ") || "Unnamed",
        sport: a.sport ?? "—",
        school: a.teamSchool ?? "—",
        classYear: a.classYear ?? "—",
        isMinor: a.isMinor,
        status: STATUS_MAP[a.status] ?? "not-started",
        flags: (a.flags as Athlete["flags"]) ?? [],
        nilIncomeYtd: a.nilIncomeYtd,
        homeState: a.homeState ?? "—",
        competingStates: a.competingStates,
      };
    }
  } catch { /* fall through to mock */ }
  const m = MOCK_ROSTER.find((r) => r.id === id);
  if (!m) return null;
  return { ...m };
}

export default async function AthleteDetail({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADVISOR") redirect("/intake");

  const athlete = await loadAthlete(params.id);
  if (!athlete) notFound();

  const goalCount = await prisma.goal.count({ where: { athleteId: athlete.id } }).catch(() => 0);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <Link href="/advisor" className="eyebrow hover:text-accent">← Roster</Link>
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
              {athlete.competingStates.length === 0 && <span className="text-slate/60 text-xs">—</span>}
            </div>
            <p className="mt-3 text-xs text-slate">
              Feeds jock tax and state NIL compliance surface.
            </p>
          </Panel>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <ToolCard eyebrow="Section 7 · A" title="Jock Tax Calculator"
            blurb="Duty-day allocation over the live schedule + current state rates. Home-state credit applied."
            href="/tools/jock-tax" cta="Open calculator" />
          <ToolCard eyebrow="Section 7 · B" title="Contract & Payment Extraction"
            blurb="Drag-drop NIL contracts. Structured deal record out — amount, schedule, exclusivity, non-cash comp, agent fee %."
            href="#" cta="Coming in Phase 1 build" disabled />
          <ToolCard eyebrow="Section 7 · C" title="Consolidated Tax Calculator"
            blurb="Federal + SE + state reconciliation. Kiddie-tax check for minors. QBI when entity exists."
            href="/tools/consolidated-tax" cta="Open calculator" />
          <ToolCard eyebrow="Section 8" title={`Goals Module${goalCount ? ` · ${goalCount}` : ""}`}
            blurb="Short / medium / long-term goals. Maps 1:1 to eMoney expense records with isGoal: true."
            href="/intake/goals" cta="Open goals" />
          <ToolCard eyebrow="Section 9-B" title="Expense Form"
            blurb="Downloadable branded spreadsheet. Standard + athlete-specific line items. Upload back for extraction."
            href="#" cta="Coming in Phase 1 build" disabled />
          <ToolCard eyebrow="Section 10" title="Export to eMoney"
            blurb="Structured Facts payload — Income, Expenses, Goals (isGoal: true), Assets/Liabilities, Advisor notes."
            href="#" cta="Manual export CSV/JSON — pending API access" disabled />
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
function ToolCard({ eyebrow, title, blurb, href, cta, disabled }: {
  eyebrow: string; title: string; blurb: string; href: string; cta: string; disabled?: boolean;
}) {
  const inner = (
    <div className={`h-full border border-line rounded-sm p-6 bg-paper transition ${
      disabled ? "opacity-60" : "hover:border-accent hover:bg-mist/40"
    }`}>
      <div className="eyebrow">{eyebrow}</div>
      <h3 className="display text-2xl mt-3 text-ink">{title}</h3>
      <p className="mt-3 text-slate text-sm leading-relaxed">{blurb}</p>
      <div className="mt-6 text-sm text-accent">{cta} {!disabled && "→"}</div>
    </div>
  );
  return disabled ? inner : <Link href={href}>{inner}</Link>;
}

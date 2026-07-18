import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import { ROSTER, STATUS_LABEL, FLAG_LABEL, type IntakeStatus } from "@/content/roster";

const statusTone: Record<IntakeStatus, string> = {
  "not-started": "bg-mist text-slate",
  "in-progress": "bg-gold text-ink",
  "plan-generated": "bg-ink text-paper",
  "synced-to-emoney": "bg-accent text-paper",
};

function formatMoney(n: number) {
  return "$" + n.toLocaleString();
}

export default function AdvisorRosterPage() {
  const total = ROSTER.length;
  const inProgress = ROSTER.filter((r) => r.status === "in-progress").length;
  const generated = ROSTER.filter((r) => r.status === "plan-generated").length;
  const synced = ROSTER.filter((r) => r.status === "synced-to-emoney").length;
  const flagged = ROSTER.filter((r) => r.flags.length > 0).length;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="eyebrow">Advisor · Roster</div>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h1 className="display text-4xl md:text-6xl mt-4 text-ink">
            Every athlete on the book.
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="mt-6 text-slate max-w-2xl leading-relaxed">
            Full-book visibility. Triage which accounts need attention without opening each
            one — status column, flag columns, YTD NIL income, and state exposure sit at the
            list level.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Accounts" value={String(total)} />
          <Stat label="In progress" value={String(inProgress)} />
          <Stat label="Plan generated" value={String(generated)} />
          <Stat label="Synced to eMoney" value={String(synced)} />
          <Stat label="Flagged" value={String(flagged)} />
        </div>

        <div className="mt-10 border border-line rounded-sm bg-paper overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-line bg-mist/60">
                <Th>Athlete</Th>
                <Th>Sport</Th>
                <Th>School</Th>
                <Th>Status</Th>
                <Th>Flags</Th>
                <Th className="text-right">NIL YTD</Th>
                <Th>Home / competing</Th>
                <Th>Last activity</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {ROSTER.map((a) => (
                <tr key={a.id} className="border-b border-line/60 hover:bg-mist/40 transition">
                  <Td>
                    <div className="text-ink font-medium">{a.name}</div>
                    <div className="text-xs text-slate mt-0.5">
                      {a.classYear}
                      {a.isMinor && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate">
                          Minor · UTMA
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>{a.sport}</Td>
                  <Td>{a.school}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase tracking-wider ${statusTone[a.status]}`}
                    >
                      {STATUS_LABEL[a.status]}
                    </span>
                  </Td>
                  <Td>
                    {a.flags.length === 0 ? (
                      <span className="text-slate/60 text-xs">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {a.flags.map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center rounded-sm border border-accent/50 text-accent text-[11px] px-2 py-0.5"
                            title={FLAG_LABEL[f]}
                          >
                            {FLAG_LABEL[f]}
                          </span>
                        ))}
                      </div>
                    )}
                  </Td>
                  <Td className="text-right tabular-nums">{formatMoney(a.nilIncomeYtd)}</Td>
                  <Td>
                    <div className="text-ink">{a.homeState}</div>
                    <div className="text-xs text-slate mt-0.5">
                      {a.competingStates.length} state{a.competingStates.length === 1 ? "" : "s"} touched
                    </div>
                  </Td>
                  <Td className="text-slate">{a.lastActivity}</Td>
                  <Td className="text-right">
                    <Link href={`/advisor/${a.id}`} className="text-accent hover:text-ink">
                      Open →
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-xs text-slate italic">
          Placeholder roster. Real accounts populate once auth and Prisma are wired in Phase 1.
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line rounded-sm p-4 bg-paper">
      <div className="eyebrow">{label}</div>
      <div className="display text-3xl mt-2 text-ink">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[11px] uppercase tracking-wider text-slate font-normal ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-4 align-top ${className}`}>{children}</td>;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import { prisma, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ROSTER as MOCK_ROSTER, STATUS_LABEL, FLAG_LABEL } from "@/content/roster";

type Row = {
  id: string;
  name: string;
  sport: string;
  school: string;
  classYear: string;
  isMinor: boolean;
  status: "not-started" | "in-progress" | "plan-generated" | "synced-to-emoney";
  flags: ("state-compliance" | "entity" | "insurance")[];
  nilIncomeYtd: number;
  homeState: string;
  competingStates: string[];
  lastActivity: string;
  live: boolean;
};

const statusTone: Record<Row["status"], string> = {
  "not-started": "bg-mist text-slate",
  "in-progress": "bg-gold text-ink",
  "plan-generated": "bg-ink text-paper",
  "synced-to-emoney": "bg-accent text-paper",
};

const STATUS_MAP: Record<string, Row["status"]> = {
  NOT_STARTED: "not-started",
  IN_PROGRESS: "in-progress",
  PLAN_GENERATED: "plan-generated",
  SYNCED_TO_EMONEY: "synced-to-emoney",
};

function formatMoney(n: number) { return "$" + n.toLocaleString(); }

function relativeTime(d: Date) {
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86_400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86_400)}d ago`;
}

async function loadRoster(): Promise<Row[]> {
  if (!isDbConfigured()) return MOCK_ROSTER.map((a) => ({ ...a, live: false }));
  try {
    const athletes = await prisma.athlete.findMany({
      orderBy: { updatedAt: "desc" },
    });
    if (athletes.length === 0) throw new Error("empty");
    return athletes.map((a) => ({
      id: a.id,
      name: [a.firstName, a.lastName].filter(Boolean).join(" ") || "Unnamed athlete",
      sport: a.sport ?? "—",
      school: a.teamSchool ?? "—",
      classYear: a.classYear ?? "—",
      isMinor: a.isMinor,
      status: STATUS_MAP[a.status] ?? "not-started",
      flags: (a.flags as Row["flags"]) ?? [],
      nilIncomeYtd: a.nilIncomeYtd,
      homeState: a.homeState ?? "—",
      competingStates: a.competingStates,
      lastActivity: relativeTime(a.updatedAt),
      live: true,
    }));
  } catch {
    return MOCK_ROSTER.map((a) => ({ ...a, live: false }));
  }
}

export default async function AdvisorRosterPage() {
  // If the DB isn't configured yet (fresh Vercel deploy without DATABASE_URL),
  // let the roster render the mock content so reviewers can see the layout
  // without needing to sign in.
  if (isDbConfigured()) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "ADVISOR") redirect("/intake");
  }

  const rows = await loadRoster();
  const anyLive = rows.some((r) => r.live);

  const total = rows.length;
  const inProgress = rows.filter((r) => r.status === "in-progress").length;
  const generated = rows.filter((r) => r.status === "plan-generated").length;
  const synced = rows.filter((r) => r.status === "synced-to-emoney").length;
  const flagged = rows.filter((r) => r.flags.length > 0).length;

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
              {rows.map((a) => (
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
          {anyLive
            ? "Live roster from Postgres. Advisors can edit any field on any account."
            : "Placeholder roster (DB empty or unreachable). Run npm run db:seed to populate."}
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

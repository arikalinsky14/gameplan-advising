import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listContracts } from "@/app/actions/contracts";
import { prisma, isDbConfigured } from "@/lib/db";
import BackToHome from "@/components/BackToHome";
import ContractsClient from "./ContractsClient";

async function homeStateForCurrentUser(): Promise<string | null> {
  if (!isDbConfigured()) return null;
  const s = await getSession();
  if (!s) return null;
  try {
    const u = await prisma.user.findUnique({
      where: { id: s.userId },
      include: { athlete: true },
    });
    return u?.athlete?.homeState ?? null;
  } catch {
    return null;
  }
}

export default async function ContractsPage() {
  const session = await getSession();
  const contracts = session ? await listContracts() : [];
  const homeState = session ? await homeStateForCurrentUser() : null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="eyebrow">Section 07 · B / H</div>
        <h1 className="display text-4xl md:text-6xl mt-4 text-ink">
          Contracts &amp; payments.
        </h1>
        <p className="mt-6 text-slate max-w-2xl leading-relaxed">
          Every NIL deal — cash, non-cash (product, vehicle use), or a mix. This
          section is your <em className="text-ink not-italic">bookkeeping record</em>:
          the raw data that decides how state and out-of-state income tax gets
          allocated. Short one-off deals just need a work state. Long-term deals
          (e.g. a season-long Nike campaign) get a contemporaneous work log — one
          entry per shoot, appearance, or content day — and the tool splits the
          net across every state you actually worked in.
        </p>

        {!session ? (
          <div className="mt-10 border-l-2 border-accent pl-4 py-4 bg-mist/40">
            <p className="text-sm text-ink">
              Sign in to save contracts to your account.{" "}
              <Link href="/login" className="text-accent underline underline-offset-4">Sign in</Link>{" "}
              or{" "}
              <Link href="/signup" className="text-accent underline underline-offset-4">create one</Link>.
            </p>
          </div>
        ) : (
          <ContractsClient
            homeState={homeState}
            initial={contracts.map((c) => ({
              id: c.id,
              brand: c.brand,
              grossAmount: c.grossAmount,
              agentFeePct: c.agentFeePct,
              nonCashFmv: c.nonCashFmv,
              paymentSchedule: c.paymentSchedule,
              termStart: c.termStart ? c.termStart.toISOString().slice(0, 10) : null,
              termEnd: c.termEnd ? c.termEnd.toISOString().slice(0, 10) : null,
              exclusivity: c.exclusivity,
              deliverables: c.deliverables,
              workState: c.workState,
              workStateConfirmed: c.workStateConfirmed,
              workLog: c.workLog.map((w) => ({
                id: w.id,
                contractId: w.contractId,
                date: w.date.toISOString().slice(0, 10),
                state: w.state,
                city: w.city,
                hours: w.hours,
                note: w.note,
                proofUrl: w.proofUrl,
                proofName: w.proofName,
              })),
            }))}
          />
        )}

        <div className="mt-16 border-t border-line pt-8 text-xs text-slate italic text-center">
          Upload-based extraction (drag-drop the PDF, we pull the numbers)
          drops in later once the LLM vendor decision lands.
        </div>

        <BackToHome />
      </div>
    </section>
  );
}

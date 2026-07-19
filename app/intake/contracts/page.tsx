import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listContracts } from "@/app/actions/contracts";
import ContractsClient from "./ContractsClient";

export default async function ContractsPage() {
  const session = await getSession();
  const contracts = session ? await listContracts() : [];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="eyebrow">Section 07 · B / H</div>
        <h1 className="display text-4xl md:text-6xl mt-4 text-ink">
          Contracts &amp; payments.
        </h1>
        <p className="mt-6 text-slate max-w-2xl leading-relaxed">
          Every NIL deal — cash, non-cash (product, vehicle use), or a mix. Enter
          the terms once; the tool tracks gross, agent / rep fee, and the net that
          actually reaches you. Non-cash comp is counted at fair market value so it
          flows into the tax estimator the same way as cash.
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
            }))}
          />
        )}

        <div className="mt-16 border-t border-line pt-8 text-xs text-slate italic">
          Upload-based extraction (drag-drop the PDF, we pull the numbers) is on
          the roadmap. For now this is a manual entry form — same fields, same
          data, no waiting on the LLM vendor decision.
        </div>
      </div>
    </section>
  );
}

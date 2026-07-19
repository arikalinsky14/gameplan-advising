import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listGoals } from "@/app/actions/goals";
import GoalsClient from "./GoalsClient";

export default async function GoalsPage() {
  const session = await getSession();
  const goals = session ? await listGoals() : [];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="eyebrow">Section 08 · Goals</div>
        <h1 className="display text-4xl md:text-6xl mt-4 text-ink">
          Tell us how high you expect to go.
        </h1>
        <p className="mt-6 text-slate max-w-2xl leading-relaxed">
          Short, medium, long. Whatever&rsquo;s in your head, drop it in — the planning
          happens around <em className="text-ink not-italic">your</em> goals, not the other
          way around. Each goal maps directly to an eMoney expense record with
          <code className="text-xs bg-mist px-1 mx-1 rounded-sm">isGoal: true</code>.
        </p>

        {!session ? (
          <div className="mt-10 border-l-2 border-accent pl-4 py-4 bg-mist/40">
            <p className="text-sm text-ink">
              Sign in to save goals to your account.{" "}
              <Link href="/login" className="text-accent underline underline-offset-4">Sign in</Link>{" "}
              or{" "}
              <Link href="/signup" className="text-accent underline underline-offset-4">create one</Link>.
            </p>
          </div>
        ) : (
          <GoalsClient initial={goals.map((g) => ({
            id: g.id,
            bucket: g.bucket as "SHORT" | "MEDIUM" | "LONG",
            text: g.text,
            years: g.years,
          }))} />
        )}

        <div className="mt-16 border-t border-line pt-8 flex flex-wrap justify-between gap-4">
          <Link href="/intake" className="text-sm text-slate hover:text-accent">
            ← Back to intake
          </Link>
          <div className="text-xs text-slate italic">
            Persists to Postgres. Exports as eMoney expense records with{" "}
            <code className="text-[11px] bg-mist px-1 rounded-sm">isGoal: true</code>.
          </div>
        </div>
      </div>
    </section>
  );
}

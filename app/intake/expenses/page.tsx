import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listExpenses } from "@/app/actions/expenses";
import ExpensesClient from "./ExpensesClient";

export default async function ExpensesPage() {
  const session = await getSession();
  const rows = session ? await listExpenses() : [];
  const initial: Record<string, number> = {};
  for (const r of rows) initial[r.category] = r.amount;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="eyebrow">Section 09 · B</div>
        <h1 className="display text-4xl md:text-6xl mt-4 text-ink">Expense form.</h1>
        <p className="mt-6 text-slate max-w-2xl leading-relaxed">
          One line at a time. Enter monthly amounts where it makes sense, annual
          amounts where it doesn&rsquo;t — we&rsquo;ll normalize on the back end.
          Zero is a fine answer for any line. An empty line is not — those flag as
          &ldquo;not yet answered&rdquo; on the advisor screen.
        </p>

        <div className="mt-8 rounded-sm bg-mist/60 border border-line px-5 py-4 text-sm text-ink">
          <span className="eyebrow mr-2">Deductible flag</span>
          Athlete-specific line items are pre-marked as deductible business expenses.
          Your advisor can override any single record before the tax estimate runs.
        </div>

        {!session ? (
          <div className="mt-10 border-l-2 border-accent pl-4 py-4 bg-mist/40">
            <p className="text-sm text-ink">
              Sign in to save your expense sheet.{" "}
              <Link href="/login" className="text-accent underline underline-offset-4">Sign in</Link>{" "}
              or{" "}
              <Link href="/signup" className="text-accent underline underline-offset-4">create one</Link>.
            </p>
          </div>
        ) : (
          <ExpensesClient initial={initial} />
        )}
      </div>
    </section>
  );
}

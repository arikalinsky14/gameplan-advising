"use client";
import { useMemo, useState, useTransition } from "react";
import { createContract, deleteContract } from "@/app/actions/contracts";

type Contract = {
  id: string;
  brand: string;
  grossAmount: number;
  agentFeePct: number;
  nonCashFmv: number;
  paymentSchedule: string | null;
  termStart: string | null;
  termEnd: string | null;
  exclusivity: string | null;
  deliverables: string | null;
};

export default function ContractsClient({ initial }: { initial: Contract[] }) {
  const [contracts, setContracts] = useState<Contract[]>(initial);
  const [showForm, setShowForm] = useState(initial.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const cash = contracts.reduce((s, c) => s + c.grossAmount, 0);
    const nonCash = contracts.reduce((s, c) => s + c.nonCashFmv, 0);
    const fees = contracts.reduce(
      (s, c) => s + c.grossAmount * (c.agentFeePct || 0),
      0,
    );
    const net = cash + nonCash - fees;
    return { cash, nonCash, fees, net, total: cash + nonCash };
  }, [contracts]);

  return (
    <>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Gross cash" value={fmt(totals.cash)} />
        <Tile label="Non-cash (FMV)" value={fmt(totals.nonCash)} />
        <Tile label="Agent / rep fees" value={fmt(totals.fees)} />
        <Tile label="Net to athlete" value={fmt(totals.net)} strong />
      </div>

      <div className="mt-10 space-y-3">
        {contracts.map((c) => (
          <ContractRow
            key={c.id}
            c={c}
            onDelete={() => {
              setContracts((cs) => cs.filter((x) => x.id !== c.id));
              startTransition(() => {
                deleteContract(c.id);
              });
            }}
          />
        ))}
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-6 w-full border border-dashed border-line rounded-sm py-4 text-sm text-slate hover:border-accent hover:text-accent transition"
        >
          + Add a deal
        </button>
      )}

      {showForm && (
        <form
          className="mt-8 border border-line rounded-sm p-6 bg-paper space-y-6"
          action={(fd) =>
            startTransition(async () => {
              setError(null);
              const res = await createContract({
                brand: String(fd.get("brand") ?? ""),
                grossAmount: Number(fd.get("grossAmount") ?? 0),
                agentFeePct: Number(fd.get("agentFeePct") ?? 0) / 100,
                nonCashFmv: Number(fd.get("nonCashFmv") ?? 0),
                paymentSchedule: String(fd.get("paymentSchedule") ?? "") || null,
                termStart: String(fd.get("termStart") ?? "") || null,
                termEnd: String(fd.get("termEnd") ?? "") || null,
                exclusivity: String(fd.get("exclusivity") ?? "") || null,
                deliverables: String(fd.get("deliverables") ?? "") || null,
              });
              if (!res.ok) {
                setError(res.error);
                return;
              }
              setContracts((cs) => [
                {
                  id: res.contract.id,
                  brand: res.contract.brand,
                  grossAmount: res.contract.grossAmount,
                  agentFeePct: res.contract.agentFeePct,
                  nonCashFmv: res.contract.nonCashFmv,
                  paymentSchedule: res.contract.paymentSchedule,
                  termStart: res.contract.termStart ? res.contract.termStart.toISOString().slice(0, 10) : null,
                  termEnd: res.contract.termEnd ? res.contract.termEnd.toISOString().slice(0, 10) : null,
                  exclusivity: res.contract.exclusivity,
                  deliverables: res.contract.deliverables,
                },
                ...cs,
              ]);
              setShowForm(false);
            })
          }
        >
          <div className="eyebrow">New deal</div>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Brand / counterparty" required>
              <input name="brand" required className="input" placeholder="e.g. Nike" />
            </Field>
            <Field label="Payment schedule">
              <select name="paymentSchedule" className="input" defaultValue="one-time">
                <option value="one-time">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="on-delivery">On delivery</option>
              </select>
            </Field>
            <Field label="Gross cash ($)">
              <input name="grossAmount" type="number" min={0} step={100} required className="input tabular-nums" />
            </Field>
            <Field label="Agent / rep fee (%)">
              <input name="agentFeePct" type="number" min={0} max={50} step={0.5} defaultValue={0} className="input tabular-nums" />
            </Field>
            <Field label="Non-cash comp — FMV ($)">
              <input name="nonCashFmv" type="number" min={0} step={100} defaultValue={0} className="input tabular-nums" />
            </Field>
            <Field label="Exclusivity">
              <input name="exclusivity" className="input" placeholder="e.g. Category-exclusive, footwear" />
            </Field>
            <Field label="Term start">
              <input name="termStart" type="date" className="input" />
            </Field>
            <Field label="Term end">
              <input name="termEnd" type="date" className="input" />
            </Field>
          </div>
          <Field label="Deliverables">
            <textarea name="deliverables" rows={3} className="input resize-y" placeholder="e.g. 4 posts / month, 1 event appearance / quarter" />
          </Field>

          {error && (
            <div className="border-l-2 border-accent pl-3 py-2 bg-mist/40 text-sm text-ink">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-slate hover:text-accent"
            >
              Cancel
            </button>
            <button
              disabled={pending}
              className="rounded-full bg-ink text-paper px-6 py-3 text-sm hover:bg-accent transition disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save deal →"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label block mb-2">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function Tile({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`border rounded-sm p-4 ${strong ? "bg-ink text-paper border-ink" : "bg-paper border-line"}`}>
      <div className={`eyebrow ${strong ? "text-paper/70" : ""}`}>{label}</div>
      <div className="display text-2xl mt-2 tabular-nums">{value}</div>
    </div>
  );
}

function ContractRow({ c, onDelete }: { c: Contract; onDelete: () => void }) {
  const fee = c.grossAmount * (c.agentFeePct || 0);
  const net = c.grossAmount + c.nonCashFmv - fee;
  return (
    <div className="border border-line rounded-sm p-5 bg-paper flex flex-wrap items-baseline justify-between gap-4">
      <div>
        <div className="text-ink font-medium">{c.brand}</div>
        <div className="text-xs text-slate mt-1">
          {c.paymentSchedule ?? "—"}
          {c.termStart || c.termEnd ? ` · ${c.termStart ?? "?"} → ${c.termEnd ?? "?"}` : ""}
          {c.exclusivity ? ` · ${c.exclusivity}` : ""}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 tabular-nums text-sm">
        <div>
          <div className="field-label">Gross</div>
          <div className="text-ink">{fmt(c.grossAmount + c.nonCashFmv)}</div>
        </div>
        <div>
          <div className="field-label">Fee</div>
          <div className="text-slate">{fmt(fee)} <span className="text-[10px]">({(c.agentFeePct * 100).toFixed(1)}%)</span></div>
        </div>
        <div>
          <div className="field-label">Net</div>
          <div className="text-ink font-medium">{fmt(net)}</div>
        </div>
      </div>
      <button onClick={onDelete} className="text-xs text-slate hover:text-accent" aria-label="Delete">
        remove
      </button>
    </div>
  );
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

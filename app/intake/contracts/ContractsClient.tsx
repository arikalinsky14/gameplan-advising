"use client";
import { useMemo, useState, useTransition } from "react";
import { createContract, deleteContract } from "@/app/actions/contracts";
import {
  addWorkLogEntry,
  deleteWorkLogEntry,
  updateContractWorkState,
} from "@/app/actions/worklog";
import { STATE_LIST } from "@/content/tax";
import {
  sourceContract,
  netOf,
  type ContractForSourcing,
} from "@/content/nil-sourcing";

type WorkLogEntry = {
  id: string;
  contractId: string;
  date: string;
  state: string;
  hours: number;
  note: string | null;
};

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
  workState: string | null;
  workStateConfirmed: boolean;
  workLog: WorkLogEntry[];
};

export default function ContractsClient({
  initial,
  homeState,
}: {
  initial: Contract[];
  homeState: string | null;
}) {
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
    return { cash, nonCash, fees, net };
  }, [contracts]);

  return (
    <>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Gross cash" value={fmt(totals.cash)} />
        <Tile label="Non-cash (FMV)" value={fmt(totals.nonCash)} />
        <Tile label="Agent / rep fees" value={fmt(totals.fees)} />
        <Tile label="Net to athlete" value={fmt(totals.net)} strong />
      </div>

      <div className="mt-10 space-y-6">
        {contracts.map((c) => (
          <ContractCard
            key={c.id}
            c={c}
            homeState={homeState}
            onChange={(patched) =>
              setContracts((cs) => cs.map((x) => (x.id === patched.id ? patched : x)))
            }
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
        <NewContractForm
          onCancel={() => setShowForm(false)}
          onSubmit={(input) =>
            startTransition(async () => {
              setError(null);
              const res = await createContract(input);
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
                  workState: res.contract.workState,
                  workStateConfirmed: res.contract.workStateConfirmed,
                  workLog: [],
                },
                ...cs,
              ]);
              setShowForm(false);
            })
          }
          error={error}
          pending={pending}
        />
      )}
    </>
  );
}

/* --------- New-deal form --------- */
function NewContractForm({
  onCancel,
  onSubmit,
  error,
  pending,
}: {
  onCancel: () => void;
  onSubmit: (input: Parameters<typeof createContract>[0]) => void;
  error: string | null;
  pending: boolean;
}) {
  return (
    <form
      className="mt-8 border border-line rounded-sm p-6 bg-paper space-y-6"
      action={(fd) => {
        onSubmit({
          brand: String(fd.get("brand") ?? ""),
          grossAmount: Number(fd.get("grossAmount") ?? 0),
          agentFeePct: Number(fd.get("agentFeePct") ?? 0) / 100,
          nonCashFmv: Number(fd.get("nonCashFmv") ?? 0),
          paymentSchedule: String(fd.get("paymentSchedule") ?? "") || null,
          termStart: String(fd.get("termStart") ?? "") || null,
          termEnd: String(fd.get("termEnd") ?? "") || null,
          exclusivity: String(fd.get("exclusivity") ?? "") || null,
          deliverables: String(fd.get("deliverables") ?? "") || null,
          workState: String(fd.get("workState") ?? "") || null,
        });
      }}
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
        <Field
          label="Where was this deal's work performed?"
          hint="Not where you play — where THIS deal happened (shoot location, appearance city). Leave blank on long-term deals; add work-log entries below instead."
        >
          <select name="workState" className="input" defaultValue="">
            <option value="">Not yet — needs advisor review</option>
            {STATE_LIST.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
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
        <button type="button" onClick={onCancel} className="text-sm text-slate hover:text-accent">
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
  );
}

/* --------- Existing-deal card, with sourcing rollup + optional work log --------- */
function ContractCard({
  c,
  homeState,
  onChange,
  onDelete,
}: {
  c: Contract;
  homeState: string | null;
  onChange: (c: Contract) => void;
  onDelete: () => void;
}) {
  const [logOpen, setLogOpen] = useState(c.workLog.length > 0);
  const [addingEntry, setAddingEntry] = useState(false);
  const [, startTransition] = useTransition();

  const sourced = useMemo(
    () =>
      sourceContract(
        {
          id: c.id,
          grossAmount: c.grossAmount,
          nonCashFmv: c.nonCashFmv,
          agentFeePct: c.agentFeePct,
          workState: c.workState,
          workStateConfirmed: c.workStateConfirmed,
          workLog: c.workLog,
        } as ContractForSourcing,
        homeState ?? "",
      ),
    [c, homeState],
  );

  const net = netOf(c);
  const fee = c.grossAmount * (c.agentFeePct || 0);

  return (
    <div className="border border-line rounded-sm p-6 bg-paper">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <div className="text-ink font-medium text-lg">{c.brand}</div>
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

      {/* Sourcing rollup */}
      <div className="mt-6 border-t border-line pt-4">
        <div className="flex items-baseline justify-between">
          <div className="eyebrow">
            Sourced to
            {sourced.method === "work-log" && <span className="ml-2 normal-case text-[10px] text-accent">from work log</span>}
            {sourced.method === "single-state" && !sourced.confirmed && (
              <span className="ml-2 normal-case text-[10px] text-accent">needs advisor review</span>
            )}
            {sourced.method === "home-state-fallback" && (
              <span className="ml-2 normal-case text-[10px] text-accent">defaulted to home — needs review</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {c.workLog.length === 0 && (
              <SingleStatePicker
                current={c.workState}
                onSave={(state) => {
                  const patched = { ...c, workState: state, workStateConfirmed: !!state };
                  onChange(patched);
                  startTransition(() => {
                    updateContractWorkState({
                      contractId: c.id,
                      workState: state,
                      workStateConfirmed: !!state,
                    });
                  });
                }}
              />
            )}
            <button
              onClick={() => setLogOpen((v) => !v)}
              className="text-xs text-slate hover:text-accent"
            >
              {logOpen ? "hide" : c.workLog.length > 0 ? "work log" : "+ work log for long deals"}
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          {sourced.allocations.map((a) => (
            <div key={a.state} className="border border-line rounded-sm px-3 py-2 tabular-nums">
              <div className="text-[10px] text-slate uppercase tracking-wider">{a.state}</div>
              <div className="text-ink text-sm">{fmt(a.amount)}</div>
              <div className="text-[10px] text-slate">{(a.fraction * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Work log */}
      {logOpen && (
        <div className="mt-6 border-t border-line pt-4">
          <div className="eyebrow">Work log</div>
          <p className="mt-1 text-xs text-slate">
            One entry per work session. Hours-weighted — a full shoot day counts
            more than a 20-minute social post. Every deal-net dollar routes to
            the state you worked in on that entry.
          </p>

          {c.workLog.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">State</th>
                    <th className="py-2 pr-4 text-right">Hours</th>
                    <th className="py-2 pr-4">Note</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {c.workLog.map((e) => (
                    <tr key={e.id} className="border-t border-line/60">
                      <td className="py-2 pr-4 tabular-nums">{e.date}</td>
                      <td className="py-2 pr-4">{e.state}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{e.hours}</td>
                      <td className="py-2 pr-4 text-slate">{e.note ?? "—"}</td>
                      <td className="py-2 pr-4 text-right">
                        <button
                          onClick={() => {
                            const patched = { ...c, workLog: c.workLog.filter((x) => x.id !== e.id) };
                            onChange(patched);
                            startTransition(() => {
                              deleteWorkLogEntry(e.id);
                            });
                          }}
                          className="text-xs text-slate hover:text-accent"
                        >
                          remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!addingEntry ? (
            <button
              onClick={() => setAddingEntry(true)}
              className="mt-4 w-full border border-dashed border-line rounded-sm py-3 text-sm text-slate hover:border-accent hover:text-accent transition"
            >
              + Log a work session
            </button>
          ) : (
            <NewWorkLogEntry
              contractId={c.id}
              onCancel={() => setAddingEntry(false)}
              onSave={(entry) => {
                onChange({ ...c, workLog: [...c.workLog, entry] });
                setAddingEntry(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SingleStatePicker({
  current,
  onSave,
}: {
  current: string | null;
  onSave: (state: string | null) => void;
}) {
  return (
    <select
      value={current ?? ""}
      onChange={(e) => onSave(e.target.value || null)}
      className="text-xs bg-paper border border-line rounded-sm px-2 py-1"
      title="Single work state (one-off deal)"
    >
      <option value="">— state?</option>
      {STATE_LIST.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

function NewWorkLogEntry({
  contractId,
  onCancel,
  onSave,
}: {
  contractId: string;
  onCancel: () => void;
  onSave: (entry: WorkLogEntry) => void;
}) {
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-4 border border-line rounded-sm p-4 bg-mist/40 grid grid-cols-2 md:grid-cols-5 gap-3 items-end"
      action={(fd) =>
        startTransition(async () => {
          setError(null);
          const input = {
            contractId,
            date: String(fd.get("date") ?? ""),
            state: String(fd.get("state") ?? ""),
            hours: Number(fd.get("hours") ?? 1),
            note: String(fd.get("note") ?? "") || null,
          };
          if (!input.date || !input.state) {
            setError("Date and state required");
            return;
          }
          const res = await addWorkLogEntry(input);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          onSave({
            id: res.entry.id,
            contractId,
            date: res.entry.date.toISOString().slice(0, 10),
            state: res.entry.state,
            hours: res.entry.hours,
            note: res.entry.note,
          });
        })
      }
    >
      <label className="block">
        <span className="field-label block mb-1">Date</span>
        <input name="date" type="date" required className="input" />
      </label>
      <label className="block">
        <span className="field-label block mb-1">State</span>
        <select name="state" required className="input">
          <option value="">—</option>
          {STATE_LIST.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="field-label block mb-1">Hours</span>
        <input name="hours" type="number" step={0.5} min={0.5} defaultValue={1} className="input tabular-nums" />
      </label>
      <label className="block col-span-2">
        <span className="field-label block mb-1">Note (optional)</span>
        <input name="note" className="input" placeholder="e.g. Studio shoot" />
      </label>
      <div className="col-span-2 md:col-span-5 flex items-center justify-end gap-3 pt-2">
        {error && <div className="text-xs text-accent">{error}</div>}
        <button type="button" onClick={onCancel} className="text-xs text-slate hover:text-accent">
          Cancel
        </button>
        <button className="rounded-full bg-ink text-paper px-4 py-2 text-xs hover:bg-accent transition">
          Log session →
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
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
      {hint && <span className="mt-1 block text-[11px] text-slate">{hint}</span>}
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

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

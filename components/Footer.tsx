import { CerityLockup } from "./CerityLogo";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-line bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <div className="display text-2xl">
            Game Plan<span className="text-accent"> Action.</span>
          </div>
          <p className="mt-3 text-sm text-paper/70 max-w-sm">
            The internal advisor tool for the Cerity Partners athlete division.
            Companion to Game Plan.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <CerityLockup className="h-9 w-auto invert brightness-95" />
          </div>
          <p className="mt-3 text-[11px] text-paper/50">
            Internal use only. Not client-facing marketing.
          </p>
        </div>
        <div className="text-sm text-paper/70 md:col-span-2">
          <p className="eyebrow text-paper/60">Disclosure</p>
          <p className="mt-3 leading-relaxed">
            Every tax and planning output produced by this tool is an
            <span className="italic"> estimate for planning purposes — not a filed return.</span>{" "}
            Advisors are responsible for reviewing flagged and ambiguous cases before a
            client sees a number. All thresholds, rates, and integrations are placeholders
            pending compliance and tax-team sign-off.
          </p>
          <p className="mt-4 text-xs text-paper/50">
            Placeholder build · Phase 1 shell · eMoney API access pending
          </p>
        </div>
      </div>
    </footer>
  );
}

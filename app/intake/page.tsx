"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TIER1_SPORTS, TIER2_SPORTS, teamsByConference, TEAMS, type Team, type Sport } from "@/content/teams";

type Step = "intro" | "basics" | "sport" | "team" | "confirm" | "home";

export default function IntakePage() {
  const [step, setStep] = useState<Step>("intro");
  const [basics, setBasics] = useState({ firstName: "", lastName: "", dob: "", state: "" });
  const [sport, setSport] = useState<string | null>(null);
  const [sportId, setSportId] = useState<Sport | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  const isMinor = isMinorFromDob(basics.dob);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <Fade key="intro">
            <IntroStep onNext={() => setStep("basics")} />
          </Fade>
        )}
        {step === "basics" && (
          <Fade key="basics">
            <BasicsStep
              value={basics}
              onChange={setBasics}
              onNext={() => setStep("sport")}
            />
          </Fade>
        )}
        {step === "sport" && (
          <Fade key="sport">
            <SportStep
              onPick={(label, id) => {
                setSport(label);
                setSportId(id);
                setStep(id ? "team" : "home");
              }}
            />
          </Fade>
        )}
        {step === "team" && sportId && (
          <Fade key="team">
            <TeamStep
              sportId={sportId}
              onPick={(t) => setTeam(t)}
              onConfirm={() => setStep("confirm")}
              picked={team}
            />
          </Fade>
        )}
        {step === "confirm" && team && (
          <Fade key="confirm">
            <PinDropStep team={team} onDone={() => setStep("home")} />
          </Fade>
        )}
        {step === "home" && (
          <Fade key="home">
            <ThemedHome
              team={team}
              basics={basics}
              sport={sport}
              isMinor={isMinor}
            />
          </Fade>
        )}
      </AnimatePresence>
    </div>
  );
}

function Fade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function isMinorFromDob(dob: string): boolean {
  if (!dob) return false;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date("2026-07-18");
  const age = today.getFullYear() - d.getFullYear() - (
    today.getMonth() < d.getMonth() ||
    (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())
      ? 1 : 0
  );
  return age < 18;
}

/* -------- Step: Intro -------- */
function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <section className="min-h-[80vh] flex items-center">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="eyebrow">Client intake</div>
        <h1 className="display text-5xl md:text-8xl mt-6 text-ink">
          Your game plan<span className="text-accent">.</span>
        </h1>
        <p className="mt-8 text-xl md:text-2xl text-slate max-w-2xl leading-snug">
          You put the work in — we plan around it. Tell us how high you expect to go
          and how bad you want to succeed.
        </p>
        <button
          onClick={onNext}
          className="mt-12 rounded-full bg-ink text-paper px-8 py-4 text-sm hover:bg-accent transition"
        >
          Begin →
        </button>
        <p className="mt-6 text-xs text-slate italic max-w-lg">
          Anything you enter here can be edited later — by you, or by your advisor working
          with you. Nothing you do here is a filed anything.
        </p>
      </div>
    </section>
  );
}

/* -------- Step: Basics -------- */
function BasicsStep({
  value,
  onChange,
  onNext,
}: {
  value: { firstName: string; lastName: string; dob: string; state: string };
  onChange: (v: typeof value) => void;
  onNext: () => void;
}) {
  const canContinue = value.firstName && value.lastName && value.dob;
  const isMinor = isMinorFromDob(value.dob);

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <div className="eyebrow">Step 01 · Basic information</div>
        <h2 className="display text-4xl md:text-6xl mt-4 text-ink">Let&rsquo;s start with you.</h2>
        <p className="mt-4 text-slate max-w-xl leading-relaxed">
          Name, birthday, and the state you consider home. Home state is your legal state of
          domicile, which isn&rsquo;t always the same as your school address — we&rsquo;ll ask
          again in detail later.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <Field label="First name">
            <input
              className="input"
              value={value.firstName}
              onChange={(e) => onChange({ ...value, firstName: e.target.value })}
            />
          </Field>
          <Field label="Last name">
            <input
              className="input"
              value={value.lastName}
              onChange={(e) => onChange({ ...value, lastName: e.target.value })}
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              className="input"
              value={value.dob}
              onChange={(e) => onChange({ ...value, dob: e.target.value })}
            />
          </Field>
          <Field label="Home state (2 letters)">
            <input
              className="input uppercase"
              maxLength={2}
              value={value.state}
              onChange={(e) => onChange({ ...value, state: e.target.value.toUpperCase() })}
            />
          </Field>
        </div>

        {isMinor && (
          <div className="mt-8 border-l-2 border-accent pl-4 py-3 bg-mist/40">
            <div className="eyebrow text-accent">Minor detected</div>
            <p className="mt-2 text-sm text-ink leading-relaxed">
              Because you&rsquo;re under 18, we&rsquo;ll route your account through a
              custodial (UTMA/UGMA) structure with parent or guardian co-access. A
              guardian contact section will be added on the next screens.
            </p>
          </div>
        )}

        <div className="mt-14 flex items-center justify-between">
          <div className="text-xs text-slate">
            Any field can be edited later — by you, or by your advisor.
          </div>
          <button
            disabled={!canContinue}
            onClick={onNext}
            className="rounded-full bg-ink text-paper px-6 py-3 text-sm hover:bg-accent transition disabled:bg-mist disabled:text-slate disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label block mb-2">{label}</span>
      {children}
    </label>
  );
}

/* -------- Step: Sport -------- */
function SportStep({ onPick }: { onPick: (label: string, id: Sport | null) => void }) {
  // One flat, uniform list — no tier language surfaced to the user.
  const all: { label: string; id: Sport | null }[] = [
    ...TIER1_SPORTS.map((s) => ({ label: s.label, id: s.id as Sport | null })),
    ...TIER2_SPORTS.map((s) => ({ label: s, id: null as Sport | null })),
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <div className="eyebrow">Step 02 · Sport</div>
        <h2 className="display text-4xl md:text-6xl mt-4 text-ink">Which one&rsquo;s yours?</h2>
        <p className="mt-4 text-slate max-w-xl">
          Pick the sport you compete in. This tells us which state travel to expect and
          shapes the rest of your intake.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {all.map((s) => (
            <button
              key={s.label}
              onClick={() => onPick(s.label, s.id)}
              className="text-left border border-line rounded-sm p-5 bg-paper hover:bg-mist/60 hover:border-accent transition"
            >
              <div className="display text-xl text-ink">{s.label}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Step: Team -------- */
function TeamStep({
  sportId,
  onPick,
  onConfirm,
  picked,
}: {
  sportId: Sport;
  onPick: (t: Team) => void;
  onConfirm: () => void;
  picked: Team | null;
}) {
  const [query, setQuery] = useState("");

  const allForSport = useMemo(
    () =>
      TEAMS.filter((t) => t.sports.includes(sportId))
        .slice()
        .sort((a, b) => a.school.localeCompare(b.school)),
    [sportId],
  );

  const q = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      q.length === 0
        ? allForSport
        : allForSport.filter(
            (t) =>
              t.school.toLowerCase().includes(q) ||
              t.mascot.toLowerCase().includes(q) ||
              t.city.toLowerCase().includes(q) ||
              t.state.toLowerCase().includes(q),
          ),
    [allForSport, q],
  );

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="eyebrow">Step 03 · Team</div>
        <h2 className="display text-4xl md:text-6xl mt-4 text-ink">Find your school.</h2>
        <p className="mt-4 text-slate max-w-2xl">
          Type your school name and pick it from the list. Confirming this is what
          unlocks your personalized home, your schedule, and your jock-tax tool.
        </p>

        <div className="mt-8 relative">
          <input
            type="search"
            autoFocus
            placeholder="Search by school, mascot, city, or state"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-b-2 border-ink/30 bg-transparent py-4 pl-1 pr-10 text-lg outline-none focus:border-accent transition placeholder:text-slate/60"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-slate/50 text-sm">
            {results.length} {results.length === 1 ? "school" : "schools"}
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {results.map((t) => {
            const active = picked?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onPick(t)}
                className={`text-left border rounded-sm p-4 transition ${
                  active
                    ? "border-accent bg-mist"
                    : "border-line bg-paper hover:border-accent/60 hover:bg-mist/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <TeamBadge team={t} size={32} />
                  <div className="min-w-0">
                    <div className="text-sm text-ink font-medium leading-tight truncate">
                      {t.school}
                    </div>
                    <div className="text-[11px] text-slate mt-0.5 truncate">
                      {t.mascot} · {t.city}, {t.state}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {results.length === 0 && (
            <div className="col-span-full text-sm text-slate italic py-6">
              No matches. Try a different spelling, or enter manually below.
            </div>
          )}
        </div>

        <div className="mt-12 border-t border-line pt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-slate">
            Don&rsquo;t see your school?{" "}
            <button
              onClick={() =>
                onPick({
                  id: "manual",
                  school: query.trim() || "Manual entry",
                  mascot: "—",
                  city: "—",
                  state: "",
                  conference: "Other",
                  division: "D1",
                  primary: "#8C7758",
                  accent: "#1D2532",
                  serif: true,
                  sports: [sportId],
                } as Team)
              }
              className="text-accent underline underline-offset-4 hover:text-ink"
            >
              Enter it manually
            </button>
          </div>
          <button
            disabled={!picked}
            onClick={onConfirm}
            className="rounded-full bg-ink text-paper px-8 py-3 text-sm hover:bg-accent transition disabled:bg-mist disabled:text-slate disabled:cursor-not-allowed"
          >
            {picked ? `Confirm ${picked.school} →` : "Pick a school to continue"}
          </button>
        </div>
      </div>
    </section>
  );
}

function TeamBadge({ team, size = 40 }: { team: Team; size?: number }) {
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: team.primary,
        color: team.accent,
        boxShadow: `inset 0 0 0 2px ${team.accent}`,
        fontFamily: team.serif ? "var(--font-display)" : "var(--font-sans)",
        fontSize: size * 0.4,
        lineHeight: 1,
        fontWeight: 700,
      }}
    >
      {team.id.slice(0, 3).toUpperCase()}
    </div>
  );
}

/* -------- Step: Pin drop confirm -------- */
function PinDropStep({ team, onDone }: { team: Team; onDone: () => void }) {
  return (
    <section className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-6 text-center py-24">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: -60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto"
          style={{ color: team.primary }}
        >
          <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor" aria-hidden>
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>
          </svg>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="eyebrow mt-8">Home base</div>
          <div className="display text-4xl md:text-6xl mt-3 text-ink">
            {team.city}
            {team.state ? `, ${team.state}` : ""}
          </div>
          <div className="mt-3 text-slate">{team.school} · {team.conference}</div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={onDone}
          className="mt-12 rounded-full bg-ink text-paper px-8 py-3 text-sm hover:bg-accent transition"
        >
          Enter your home →
        </motion.button>
      </div>
    </section>
  );
}

/* -------- Step: Themed home -------- */
function ThemedHome({
  team,
  basics,
  sport,
  isMinor,
}: {
  team: Team | null;
  basics: { firstName: string; lastName: string; dob: string; state: string };
  sport: string | null;
  isMinor: boolean;
}) {
  const primary = team?.primary ?? "#8C7758";
  const accent = team?.accent ?? "#1D2532";

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-sm p-10 md:p-16 relative overflow-hidden" style={{
          background: `linear-gradient(135deg, ${primary}18 0%, ${primary}05 55%, transparent 100%)`,
          borderLeft: `4px solid ${primary}`,
        }}>
          <div className="eyebrow" style={{ color: primary }}>Your home</div>
          <h1
            className="display text-5xl md:text-8xl mt-4 text-ink"
            style={{ fontFamily: team?.serif ? "var(--font-display)" : "var(--font-sans)" }}
          >
            {basics.firstName || "Athlete"}
            <span style={{ color: accent }}>.</span>
          </h1>
          <p className="mt-6 text-lg text-slate max-w-xl">
            {team?.school ? `${team.school} · ` : ""}{sport ?? "—"}
            {isMinor ? " · Minor · UTMA structure" : ""}
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <HomeCard n="01" title="Goals"
            blurb="Short / medium / long-term. How high you expect to go."
            href="/intake/goals" primary={primary} />
          <HomeCard n="02" title="Contracts & payments"
            blurb="Drop in your NIL deals — we pull the numbers that matter."
            href="/intake/contracts" primary={primary} />
          <HomeCard n="03" title="Jock tax estimate"
            blurb="How your team travel affects what you owe, state by state."
            href="/tools/jock-tax" primary={primary} />
          <HomeCard n="04" title="Consolidated tax"
            blurb="All income, all deductions, one estimated liability."
            href="/tools/consolidated-tax" primary={primary} />
          <HomeCard n="05" title="Expense form"
            blurb="Standard and athlete-specific line items. Fill and submit."
            href="/intake/expenses" primary={primary} />
          <HomeCard n="06" title="State rules"
            blurb="The NIL rules for every state you play in. What to disclose, and where."
            href="/tools/state-nil" primary={primary} />
        </div>

        <div className="mt-16 border-t border-line pt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate italic max-w-lg">
            Anything you enter here is visible to your advisor, and either of you can
            edit any field.
          </p>
        </div>
      </div>
    </section>
  );
}

function HomeCard({ n, title, blurb, href, primary, disabled }: {
  n: string; title: string; blurb: string; href: string; primary: string; disabled?: boolean;
}) {
  const inner = (
    <div className={`h-full border border-line rounded-sm p-6 bg-paper transition ${
      disabled ? "opacity-60" : "hover:border-accent hover:bg-mist/40"
    }`}>
      <div className="eyebrow" style={{ color: disabled ? undefined : primary }}>{n}</div>
      <h3 className="display text-2xl mt-3 text-ink">{title}</h3>
      <p className="mt-3 text-slate text-sm leading-relaxed">{blurb}</p>
      <div className="mt-6 text-xs text-slate">
        {disabled ? "Coming soon" : "Open →"}
      </div>
    </div>
  );
  return disabled ? inner : <Link href={href}>{inner}</Link>;
}

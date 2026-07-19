import Link from "next/link";
import { redirect } from "next/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import { CerityMark } from "@/components/CerityLogo";
import { getSession } from "@/lib/auth";
import LandingSignInForm from "@/components/LandingSignInForm";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-stretch overflow-hidden">
      {/* Faded Cerity mark bleeding off the left edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -bottom-40 md:-left-24 md:-bottom-24 opacity-[0.06]"
      >
        <CerityMark className="w-[820px] h-[820px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 w-full grid md:grid-cols-12 gap-12 items-center relative">
        {/* Left — brand + one-line promise */}
        <div className="md:col-span-7">
          <ScrollReveal delay={0.05}>
            <div className="eyebrow">Cerity Partners · Athlete Division</div>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <h1 className="display text-5xl md:text-8xl mt-6 text-ink">
              Game Plan<span className="text-accent">.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-8 text-xl md:text-2xl text-slate max-w-xl leading-snug">
              Financial planning built specifically for the college and NIL athlete —
              income, taxes, and the plan for after the playing career.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.28}>
            <p className="mt-4 text-sm text-slate max-w-md">
              Sign in to continue your intake, review your plan, or open your advisor
              dashboard.
            </p>
          </ScrollReveal>
        </div>

        {/* Right — sign-in card */}
        <div className="md:col-span-5">
          <div className="border border-line bg-paper rounded-sm p-8 md:p-10 shadow-[0_1px_0_rgba(29,37,50,0.04)]">
            <div className="eyebrow">Sign in</div>
            <h2 className="display text-3xl mt-3 text-ink">Welcome back.</h2>

            <div className="mt-8">
              <LandingSignInForm />
            </div>

            <div className="mt-8 border-t border-line pt-6 text-sm text-slate">
              First time here?{" "}
              <Link href="/signup" className="text-accent hover:text-ink">
                Create your account
              </Link>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-slate leading-relaxed">
            Cerity Partners is a registered investment adviser. Nothing in this
            application constitutes a filed tax return or personalized investment
            advice. Every planning output is an estimate for discussion with your
            advisor.
          </p>
        </div>
      </div>
    </section>
  );
}

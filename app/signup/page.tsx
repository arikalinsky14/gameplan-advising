"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"CLIENT" | "ADVISOR">("CLIENT");
  const [pending, startTransition] = useTransition();

  return (
    <section className="min-h-[80vh] flex items-center">
      <div className="max-w-md w-full mx-auto px-6 py-24">
        <div className="eyebrow">Create account</div>
        <h1 className="display text-4xl md:text-5xl mt-4 text-ink">
          Get started<span className="text-accent">.</span>
        </h1>
        <p className="mt-3 text-slate text-sm">
          Client accounts hold one athlete profile. Advisor accounts see the full roster.
        </p>

        <form
          className="mt-10 space-y-6"
          action={(fd) =>
            startTransition(async () => {
              setError(null);
              fd.set("role", role);
              const res = await signup(fd);
              if (!res.ok) setError(res.error);
              else router.push("/dashboard");
            })
          }
        >
          <div className="grid grid-cols-2 gap-2">
            {(["CLIENT", "ADVISOR"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-sm border py-3 text-sm transition ${
                  role === r
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-ink hover:border-accent"
                }`}
              >
                {r === "CLIENT" ? "Athlete / family" : "Advisor"}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="field-label block mb-2">Full name</span>
            <input name="displayName" className="input" autoComplete="name" />
          </label>
          <label className="block">
            <span className="field-label block mb-2">Email</span>
            <input name="email" type="email" required autoComplete="email" className="input" />
          </label>
          <label className="block">
            <span className="field-label block mb-2">Password</span>
            <input name="password" type="password" required autoComplete="new-password" minLength={8} className="input" />
            <span className="text-[11px] text-slate mt-1 block">Minimum 8 characters.</span>
          </label>

          {error && (
            <div className="border-l-2 border-accent pl-3 py-2 bg-mist/40 text-sm text-ink">
              {error}
            </div>
          )}

          <button
            disabled={pending}
            className="w-full rounded-full bg-ink text-paper py-3 text-sm hover:bg-accent transition disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create account →"}
          </button>
        </form>

        <div className="mt-8 text-sm text-slate">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-ink">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

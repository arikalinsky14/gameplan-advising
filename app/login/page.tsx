"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="min-h-[80vh] flex items-center">
      <div className="max-w-md w-full mx-auto px-6 py-24">
        <div className="eyebrow">Sign in</div>
        <h1 className="display text-4xl md:text-5xl mt-4 text-ink">Welcome back.</h1>
        <p className="mt-3 text-slate text-sm">
          Client or advisor. Your role is set on the account itself.
        </p>

        <form
          className="mt-10 space-y-6"
          action={(fd) =>
            startTransition(async () => {
              setError(null);
              const res = await login(fd);
              if (!res.ok) setError(res.error);
              else router.push("/dashboard");
            })
          }
        >
          <label className="block">
            <span className="field-label block mb-2">Email</span>
            <input name="email" type="email" required autoComplete="email" className="input" />
          </label>
          <label className="block">
            <span className="field-label block mb-2">Password</span>
            <input name="password" type="password" required autoComplete="current-password" className="input" />
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
            {pending ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <div className="mt-8 text-sm text-slate">
          New here?{" "}
          <Link href="/signup" className="text-accent hover:text-ink">
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}

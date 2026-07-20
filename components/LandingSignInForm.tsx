"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";

export default function LandingSignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-6"
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
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="field-label block mb-2">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
        />
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
  );
}

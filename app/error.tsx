"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const looksLikeDb =
    /DATABASE_URL|PrismaClientInitializationError|prisma/i.test(error.message ?? "");

  return (
    <section className="min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="eyebrow">Something went wrong</div>
        <h1 className="display text-4xl md:text-5xl mt-4 text-ink">
          {looksLikeDb ? "The database isn't reachable." : "This page hit an error."}
        </h1>

        {looksLikeDb ? (
          <div className="mt-6 text-slate leading-relaxed space-y-4">
            <p>
              This deployment is missing <code className="text-xs bg-mist px-1 rounded-sm">DATABASE_URL</code>{" "}
              (or the value it has can&rsquo;t be reached).
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Attach a Postgres database in Vercel → Storage, or paste a Neon connection string as <code className="text-xs bg-mist px-1 rounded-sm">DATABASE_URL</code>.</li>
              <li>
                Set <code className="text-xs bg-mist px-1 rounded-sm">AUTH_SECRET</code> to a random string.
              </li>
              <li>Redeploy.</li>
            </ol>
            <p className="text-xs text-slate italic">Full walkthrough in the README under &ldquo;Deploying to Vercel&rdquo;.</p>
          </div>
        ) : (
          <p className="mt-6 text-slate">{error.message}</p>
        )}

        <div className="mt-10 flex gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-ink text-paper px-6 py-3 text-sm hover:bg-accent transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-ink/20 px-6 py-3 text-sm hover:bg-ink hover:text-paper transition"
          >
            Home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-10 text-xs text-slate">Digest: {error.digest}</p>
        )}
      </div>
    </section>
  );
}

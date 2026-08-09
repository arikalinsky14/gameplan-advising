import Link from "next/link";

// Client-component-safe variant of BackToHome. Points at /dashboard which
// server-side redirects to the correct home for each role.
export default function BackToHomeClient() {
  return (
    <div className="mt-16 border-t border-line pt-8 flex justify-center">
      <Link
        href="/dashboard"
        className="rounded-full border border-ink/20 px-6 py-3 text-sm hover:bg-ink hover:text-paper transition"
      >
        ← Back to home
      </Link>
    </div>
  );
}

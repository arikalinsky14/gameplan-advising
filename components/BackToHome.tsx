import Link from "next/link";
import { getSession } from "@/lib/auth";

/**
 * Bottom-of-page return chip. Routes to the correct home based on role:
 * clients get their intake themed home, advisors get the roster.
 * Anonymous users get the marketing landing.
 */
export default async function BackToHome() {
  const s = await getSession();
  const href =
    s?.role === "ADVISOR" ? "/advisor" :
    s?.role === "CLIENT"  ? "/intake" :
    "/";
  const label =
    s?.role === "ADVISOR" ? "Back to roster" :
    s?.role === "CLIENT"  ? "Back to your home" :
    "Back to home";

  return (
    <div className="mt-16 border-t border-line pt-8 flex justify-center">
      <Link
        href={href}
        className="rounded-full border border-ink/20 px-6 py-3 text-sm hover:bg-ink hover:text-paper transition"
      >
        ← {label}
      </Link>
    </div>
  );
}

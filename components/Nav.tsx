import Link from "next/link";
import { CerityLogo } from "./CerityLogo";

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-paper/85 border-b border-line">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 text-ink">
          <span className="display text-xl tracking-tight">
            <span className="text-ink">Game Plan</span>
            <span className="text-accent"> Action.</span>
          </span>
          <span className="flex items-center pl-4 ml-1 border-l border-line">
            <CerityLogo className="h-7 w-auto" />
          </span>
          <span className="eyebrow ml-2 hidden md:inline">Internal · Advisor tool</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/advisor" className="hover:text-accent">Roster</Link>
          <Link href="/intake" className="hover:text-accent">Client intake</Link>
          <Link href="/tools/jock-tax" className="hover:text-accent">Jock tax</Link>
          <Link
            href="/advisor"
            className="rounded-full border border-ink/20 px-4 py-1.5 hover:bg-ink hover:text-paper transition"
          >
            Open dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

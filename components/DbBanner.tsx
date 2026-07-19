import { isDbConfigured } from "@/lib/db";

export default function DbBanner() {
  if (isDbConfigured()) return null;
  return (
    <div className="bg-accent text-paper text-[13px] px-6 py-2 border-b border-ink/20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <span>
          <span className="eyebrow text-paper/80 mr-2">Demo mode</span>
          No database connected. Signup / login / persistence disabled — see README §Deploying to Vercel.
        </span>
        <span className="text-[11px] text-paper/70 uppercase tracking-wider">
          Attach Neon in Vercel Storage &amp; set AUTH_SECRET → Redeploy
        </span>
      </div>
    </div>
  );
}

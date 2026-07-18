import type { ReactNode } from "react";
import ScrollReveal from "./ScrollReveal";

export default function NumberedSection({
  index,
  eyebrow,
  title,
  children,
}: {
  index: number;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-line py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-3">
          <ScrollReveal>
            <div className="eyebrow">
              {String(index).padStart(2, "0")} — {eyebrow}
            </div>
          </ScrollReveal>
        </div>
        <div className="md:col-span-9">
          <ScrollReveal delay={0.05}>
            <h2 className="display text-4xl md:text-5xl text-ink max-w-3xl">{title}</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="mt-8 text-lg leading-relaxed text-slate space-y-5 max-w-3xl">
              {children}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        slate: "var(--slate)",
        paper: "var(--paper)",
        mist: "var(--mist)",
        gold: "var(--gold)",
        accent: "var(--accent)",
        line: "var(--line)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: { tightish: "-0.015em", widish: "0.14em" },
    },
  },
  plugins: [],
};
export default config;

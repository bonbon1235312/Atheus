import forms from "@tailwindcss/forms";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // Discord-native blurple, dark-navy base.
        ink: "#13141C", // page background, deep navy-ink
        graphite: "#1E2030", // raised surface
        slate: "#262A3D", // hover surface
        chalk: "#F2F3F8", // primary text / off-white
        acid: "#5865F2", // brand accent (Discord blurple) — keeps token name
        blurple: "#5865F2",
        blurpleHi: "#818CF8",
        flare: "#ED4245", // Discord red (sparing)
        signal: "#57F287", // Discord green (sparing)
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        studio: "0 24px 70px rgba(0, 0, 0, 0.4)",
        soft: "0 18px 42px rgba(0, 0, 0, 0.25)",
        glow: "0 10px 40px rgba(88, 101, 242, 0.35)",
      },
      transitionTimingFunction: {
        studio: "cubic-bezier(.2,.8,.2,1)",
      },
    },
  },
  plugins: [forms],
};

export default config;

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
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      colors: {
        ink: "#050505",
        chalk: "#f4efe6",
        graphite: "#161616",
        acid: "#c8ff4a",
        flare: "#ff5d3d",
        signal: "#5f7dff",
      },
      boxShadow: {
        studio: "0 24px 70px rgba(0, 0, 0, 0.32)",
        soft: "0 18px 42px rgba(0, 0, 0, 0.12)",
      },
      transitionTimingFunction: {
        studio: "cubic-bezier(.2,.8,.2,1)",
      },
    },
  },
  plugins: [forms],
};

export default config;

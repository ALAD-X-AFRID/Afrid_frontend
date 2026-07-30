import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "var(--color-text)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        card: "var(--color-card)",
        "card-hover": "var(--color-card-hover)",
        border: "var(--color-border-soft)",
        "border-strong": "var(--color-border-strong)",
        muted: "var(--color-muted)",
        "muted-strong": "var(--color-text)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        danger: "var(--color-danger)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        accent: {
          cyan: "var(--color-primary)",
          gold: "var(--color-secondary)",
          terracotta: "var(--color-danger)",
          quantum: "var(--color-primary)",
          refined: "var(--color-secondary)",
          kinetic: "var(--color-danger)",
        },
        sovereign: {
          obsidian: "var(--color-background)",
          slate: "var(--color-surface)",
          carbon: "var(--color-surface)",
          steel: "var(--color-card)",
          forest: "var(--color-background)",
          leaf: "var(--color-text)",
          sage: "var(--color-primary)",
          earth: "var(--color-secondary)",
          clay: "var(--color-danger)",
          sand: "var(--color-secondary)",
        },
        afrid: {
          black: "var(--color-background)",
          gray: "var(--color-surface)",
          muted: "var(--color-muted)",
          white: "var(--color-text)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(ellipse at top, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
        "gradient-yield": "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)",
        "gradient-kinetic": "linear-gradient(135deg, var(--color-danger) 0%, #ff8e8e 100%)",
        "gradient-sovereign": "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-danger) 100%)",
        "mesh": "radial-gradient(at 0% 0%, rgba(57,224,255,0.12) 0px, transparent 55%), radial-gradient(at 100% 0%, rgba(178,123,255,0.10) 0px, transparent 55%), radial-gradient(at 50% 100%, rgba(3,4,13,0.8) 0px, transparent 55%)",
      },
      boxShadow: {
        glow: "0 0 48px var(--color-glow-primary)",
        "glow-lg": "0 0 80px var(--color-glow-primary)",
        "glow-sm": "0 0 20px var(--color-glow-secondary)",
        "glow-cyan": "0 0 40px var(--color-glow-primary)",
        "glow-gold": "0 0 40px var(--color-glow-secondary)",
        "glow-kinetic": "0 0 40px var(--color-glow-danger)",
        "tactical": "0 14px 36px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        wide: "0.02em",
        wider: "0.04em",
        tactical: "0.12em",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Space Grotesk", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "packet-flow": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "20%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { transform: "translateY(200%)", opacity: "0" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0.2" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "packet-flow": "packet-flow 3s linear infinite",
        "scan-line": "scan-line 8s linear infinite",
        "blink": "blink 1.2s steps(2) infinite",
        "gradient-x": "gradient-x 6s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;

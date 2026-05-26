import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg-base)",
        foreground: "var(--color-text-primary)",
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        "primary-dark": "var(--color-primary-dark)",
        success: "var(--color-success)",
        "success-text": "var(--color-success-text)",
        warning: "var(--color-warning)",
        "warning-text": "var(--color-warning-text)",
        error: "var(--color-error)",
        "error-text": "var(--color-error-text)",
        border: "var(--color-border)",
        muted: "var(--color-text-muted)",
        "text-secondary": "var(--color-text-secondary)",
        "bg-elevated": "var(--color-bg-elevated)",
        "bg-card": "var(--color-bg-card)",
        suggestion: "var(--color-suggestion-bg)",
      },
      borderRadius: {
        input: "var(--radius-input)",
        button: "var(--radius-button)",
        card: "var(--radius-card)",
      },
      maxWidth: {
        feed: "680px",
        dashboard: "1200px",
      },
      boxShadow: {
        card: "0 2px 16px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 32px rgba(0, 98, 59, 0.15)",
        float: "0 8px 32px rgba(0, 0, 0, 0.15)",
        modal: "0 20px 25px rgba(0, 0, 0, 0.10), 0 8px 10px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;

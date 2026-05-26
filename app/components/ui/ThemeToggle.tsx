"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";

export function ThemeToggle({ className }: { className?: string }): React.ReactElement {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-base)] hover:text-[var(--color-text-primary)] ${className ?? ""}`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  );
}
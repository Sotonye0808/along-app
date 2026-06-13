"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/app/providers/ThemeProvider"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed lg:bottom-6 bottom-24 right-6 z-50 w-12 h-12 rounded-full bg-bg-card border border-border shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-base focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 cursor-pointer"
    >
      {isDark ? (
        <Sun size={20} className="text-text-primary" />
      ) : (
        <Moon size={20} className="text-text-primary" />
      )}
    </button>
  )
}

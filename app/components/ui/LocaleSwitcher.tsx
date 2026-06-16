"use client"

import { useTranslation } from "@/app/providers/I18nProvider"
import { LOCALES } from "@/app/lib/config/i18n"
import type { Locale } from "@/app/lib/config/i18n"
import { Globe } from "lucide-react"

export default function LocaleSwitcher() {
  const { locale, setLocale } = useTranslation()

  const toggle = () => {
    const next = LOCALES.find((l) => l.code !== locale)?.code ?? "en"
    setLocale(next as Locale)
  }

  const current = LOCALES.find((l) => l.code === locale)

  return (
    <button
      onClick={toggle}
      aria-label={locale === "en" ? "Switch language to Pidgin" : "Switch language to English"}
      aria-live="polite"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 radius-md text-xs font-medium text-text-secondary hover:bg-bg-elevated transition-colors duration-fast border border-border cursor-pointer"
    >
      <Globe size={14} className="shrink-0" />
      <span>{current?.label ?? "English"}</span>
    </button>
  )
}

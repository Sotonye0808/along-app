"use client"

import { useTranslation } from "@/app/providers/I18nProvider"
import { LOCALES } from "@/app/lib/config/i18n"
import type { Locale } from "@/app/lib/config/i18n"

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
      aria-label={`Switch language to ${locale === "en" ? "Pidgin" : "English"}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 radius-md text-xs font-medium text-text-secondary hover:bg-bg-elevated transition-colors duration-fast border border-border cursor-pointer"
    >
      <span className="text-sm leading-none">{current?.flag ?? "🇬🇧"}</span>
      <span>{current?.label ?? "English"}</span>
    </button>
  )
}

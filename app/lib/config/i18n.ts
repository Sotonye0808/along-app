export type Locale = "en" | "pcm"

export interface LocaleConfig {
  code: Locale
  label: string
  flag: string
  direction: "ltr" | "rtl"
}

export const LOCALES: LocaleConfig[] = [
  { code: "en", label: "English", flag: "🇬🇧", direction: "ltr" },
  { code: "pcm", label: "Pidgin", flag: "🇳🇬", direction: "ltr" },
]

export const DEFAULT_LOCALE: Locale = "en"

export const STORAGE_KEY = "along-locale"

export type TranslationMap = Record<string, string | Record<string, string>>

import type { AvatarConfig } from "@/app/lib/types";

const DICEBEAR_BASE = "https://api.dicebear.com/9.x";

export const AVATAR_STYLES = [
  { value: "avataaars", label: "Avataaars" },
  { value: "bottts", label: "Bottts" },
  { value: "lorelei", label: "Lorelei" },
  { value: "notionists", label: "Notionists" },
  { value: "thumbs", label: "Thumbs" },
] as const;

export function buildAvatarUrl(config: AvatarConfig): string {
  const params = new URLSearchParams();
  if (config.seed) params.set("seed", config.seed);
  if (config.flip) params.set("flip", "true");
  if (config.backgroundColor) params.set("backgroundColor", config.backgroundColor);
  const qs = params.toString();
  return `${DICEBEAR_BASE}/${config.style}/svg${qs ? `?${qs}` : ""}`;
}

export function getFallbackAvatarUrl(firstName: string): string {
  return `${DICEBEAR_BASE}/avataaars/svg?seed=${encodeURIComponent(firstName)}`;
}

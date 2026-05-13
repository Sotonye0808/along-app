import { siteConfigRepository } from "@/lib/db/SiteConfigRepository";
import { DEFAULT_VALIDITY_CONFIG } from "@/lib/config/validityConfig";
import type { ValidityConfig } from "@/lib/config/validityConfig";
import { DEFAULT_FEED_CONFIG } from "@/lib/config/feedAlgorithm";
import type { FeedAlgorithmConfig } from "@/lib/config/feedAlgorithm";
import { DEFAULT_EMAIL_CONFIG, DEFAULT_EMAIL_TEMPLATES } from "@/lib/config/email";

type SiteConfigKey =
  | "validityConfig"
  | "feedAlgorithm"
  | "email"
  | "emailTemplates";

type SiteConfigValueMap = {
  validityConfig: ValidityConfig;
  feedAlgorithm: FeedAlgorithmConfig;
  email: EmailConfig;
  emailTemplates: EmailTemplateConfig;
};

const DEFAULTS: SiteConfigValueMap = {
  validityConfig: DEFAULT_VALIDITY_CONFIG,
  feedAlgorithm: DEFAULT_FEED_CONFIG,
  email: DEFAULT_EMAIL_CONFIG,
  emailTemplates: DEFAULT_EMAIL_TEMPLATES,
};

export async function getSiteConfig<K extends SiteConfigKey>(
  key: K,
  fallback?: SiteConfigValueMap[K],
): Promise<SiteConfigValueMap[K]> {
  const value = await siteConfigRepository.get<SiteConfigValueMap[K]>(key);
  if (value !== null) {
    return value;
  }
  return fallback ?? DEFAULTS[key];
}

export async function setSiteConfig<K extends SiteConfigKey>(
  key: K,
  value: SiteConfigValueMap[K],
): Promise<void> {
  await siteConfigRepository.set(key, value);
}

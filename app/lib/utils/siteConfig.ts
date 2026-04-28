import { siteConfigRepository } from "@/lib/db/SiteConfigRepository";
import { DEFAULT_VALIDITY_CONFIG } from "@/lib/config/validityConfig";
import type { ValidityConfig } from "@/lib/config/validityConfig";
import { DEFAULT_FEED_CONFIG } from "@/lib/config/feedAlgorithm";
import type { FeedAlgorithmConfig } from "@/lib/config/feedAlgorithm";

type SiteConfigKey = "validityConfig" | "feedAlgorithm";

type SiteConfigValueMap = {
  validityConfig: ValidityConfig;
  feedAlgorithm: FeedAlgorithmConfig;
};

const DEFAULTS: SiteConfigValueMap = {
  validityConfig: DEFAULT_VALIDITY_CONFIG,
  feedAlgorithm: DEFAULT_FEED_CONFIG,
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

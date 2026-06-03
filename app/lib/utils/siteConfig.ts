import { prisma } from "@/app/lib/db/prisma";
import { redis } from "@/app/lib/db/redis";
import { CACHE_TTL, CACHE_KEYS } from "@/app/lib/config/cache";

export async function getSiteConfig<T>(key: string, defaultValue: T): Promise<T> {
  const cacheKey = CACHE_KEYS.siteConfig(key);
  try {
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch {}
  try {
    const entry = await prisma.siteConfig.findUnique({ where: { key } });
    if (entry && entry.value !== null && entry.value !== undefined) {
      const val = entry.value as T;
      await redis.set(cacheKey, JSON.stringify(val), { ex: CACHE_TTL.siteConfig });
      return val;
    }
  } catch {}
  return defaultValue;
}

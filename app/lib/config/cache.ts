import { CACHE_KEYS as LEGACY_CACHE_KEYS, CACHE_TTL as LEGACY_CACHE_TTL } from "@/lib/cache/redis";

export interface CacheTtlConfig {
    feed: number;
    profile: number;
    post: number;
    trending: number;
    suggestions: number;
    search: number;
}

export interface CacheKeyBuilder {
    userFeed: (userId: string, cursor?: string) => string;
    userProfile: (userId: string) => string;
    post: (postId: string) => string;
    trendingPosts: () => string;
    userSuggestions: (userId: string) => string;
    searchResults: (query: string, type: string) => string;
    userStats: (userId: string) => string;
}

export const CACHE_TTL: CacheTtlConfig = { ...LEGACY_CACHE_TTL };

export const CACHE_KEYS: CacheKeyBuilder = { ...LEGACY_CACHE_KEYS };

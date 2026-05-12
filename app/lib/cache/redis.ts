/**
 * Redis Cache Configuration
 * 
 * This file contains the Redis client setup and cache utility functions.
 * - In development: Uses in-memory mock Redis (no external connection needed)
 * - In production: Uses Upstash Redis for serverless edge compatibility
 */

import { Redis } from '@upstash/redis';
import { mockRedis } from './mock-redis';
import { getCacheKeyPrefix, isProjectDev } from "@/lib/utils/env";

// Determine if we should use mock Redis (development mode)
const USE_MOCK_REDIS = !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN;

const KEY_PREFIX = getCacheKeyPrefix();

function withPrefix(key: string): string {
    return KEY_PREFIX ? `${KEY_PREFIX}${key}` : key;
}

// Initialize Redis client
const redis = USE_MOCK_REDIS
    ? mockRedis
    : new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

// Log which Redis implementation is being used
if (USE_MOCK_REDIS) {
    console.log('Using mock Redis (in-memory).');
} else {
    const label = isProjectDev() ? 'development' : 'production';
    console.log(`Using Upstash Redis (${label}).`);
}

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
    feed: 5 * 60, // 5 minutes
    profile: 10 * 60, // 10 minutes
    post: 15 * 60, // 15 minutes
    trending: 10 * 60, // 10 minutes
    suggestions: 30 * 60, // 30 minutes
    search: 5 * 60, // 5 minutes
};

// Cache key prefixes
export const CACHE_KEYS = {
    userFeed: (userId: string, cursor?: string) =>
        `feed:${userId}${cursor ? `:${cursor}` : ''}`,
    userProfile: (userId: string) => `user:${userId}`,
    post: (postId: string) => `post:${postId}`,
    trendingPosts: () => 'trending:posts',
    userSuggestions: (userId: string) => `suggestions:${userId}`,
    searchResults: (query: string, type: string) => `search:${type}:${query}`,
    userStats: (userId: string) => `stats:${userId}`,
};

// Cache helper functions
export const cache = {
    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await redis.get<T>(withPrefix(key));
            return value;
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    },

    /**
     * Set value in cache with TTL
     */
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            if (ttl) {
                await redis.setex(withPrefix(key), ttl, JSON.stringify(value));
            } else {
                await redis.set(withPrefix(key), JSON.stringify(value));
            }
        } catch (error) {
            console.error('Redis set error:', error);
        }
    },

    /**
     * Delete value from cache
     */
    async del(key: string): Promise<void> {
        try {
            await redis.del(withPrefix(key));
        } catch (error) {
            console.error('Redis delete error:', error);
        }
    },

    /**
     * Delete multiple keys matching a pattern
     */
    async delPattern(pattern: string): Promise<void> {
        try {
            const keys = await redis.keys(withPrefix(pattern));
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error('Redis delete pattern error:', error);
        }
    },

    /**
     * Increment counter
     */
    async incr(key: string): Promise<number> {
        try {
            return await redis.incr(withPrefix(key));
        } catch (error) {
            console.error('Redis incr error:', error);
            return 0;
        }
    },

    /**
     * Set expiry on a key
     */
    async expire(key: string, seconds: number): Promise<void> {
        try {
            await redis.expire(withPrefix(key), seconds);
        } catch (error) {
            console.error('Redis expire error:', error);
        }
    },

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(withPrefix(key));
            return result === 1;
        } catch (error) {
            console.error('Redis exists error:', error);
            return false;
        }
    },

    /**
     * Get remaining TTL for a key
     */
    async ttl(key: string): Promise<number> {
        try {
            return await redis.ttl(withPrefix(key));
        } catch (error) {
            console.error('Redis ttl error:', error);
            return -1;
        }
    },

    // Sorted Set operations for rate limiting

    /**
     * Add member to sorted set with score
     */
    async zadd(key: string, score: number, member: string): Promise<number> {
        try {
            const result = await redis.zadd(withPrefix(key), { score, member });
            return result ?? 0;
        } catch (error) {
            console.error('Redis zadd error:', error);
            return 0;
        }
    },

    /**
     * Get count of members in sorted set
     */
    async zcard(key: string): Promise<number> {
        try {
            return await redis.zcard(withPrefix(key));
        } catch (error) {
            console.error('Redis zcard error:', error);
            return 0;
        }
    },

    /**
     * Get members in sorted set by index range
     */
    async zrange(key: string, start: number, stop: number, options?: { withScores?: boolean }): Promise<Array<string | number>> {
        try {
            if (options?.withScores) {
                return await redis.zrange(withPrefix(key), start, stop, { withScores: true });
            }
            return await redis.zrange(withPrefix(key), start, stop);
        } catch (error) {
            console.error('Redis zrange error:', error);
            return [];
        }
    },

    /**
     * Remove members from sorted set by score range
     */
    async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
        try {
            return await redis.zremrangebyscore(withPrefix(key), min, max);
        } catch (error) {
            console.error('Redis zremrangebyscore error:', error);
            return 0;
        }
    },
};

export default redis;

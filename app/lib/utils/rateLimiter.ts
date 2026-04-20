/**
 * Rate Limiter Utility
 * 
 * Redis-based rate limiting using sliding window algorithm.
 * Protects API endpoints from abuse and ensures fair usage.
 */

import { cache } from '../cache/redis';

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
}

export interface RateLimitConfig {
    maxRequests: number;
    windowSeconds: number;
}

/**
 * Generic rate limiter using Redis sliding window
 * @param key - Unique key for the rate limit (e.g., IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export async function rateLimit(
    key: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    try {
        const { maxRequests, windowSeconds } = config;
        const now = Date.now();
        const windowStart = now - windowSeconds * 1000;

        // Redis key for this rate limit
        const redisKey = `ratelimit:${key}`;

        // Remove old entries outside the window
        await cache.zremrangebyscore(redisKey, 0, windowStart);

        // Count requests in current window
        const requestCount = await cache.zcard(redisKey);

        if (requestCount >= maxRequests) {
            // Get the oldest request timestamp
            const oldestRequests = await cache.zrange(redisKey, 0, 0, { withScores: true });
            const oldestTimestamp = oldestRequests[1] as number;
            const resetTime = Math.ceil((oldestTimestamp + windowSeconds * 1000 - now) / 1000);

            return {
                success: false,
                limit: maxRequests,
                remaining: 0,
                reset: resetTime,
                retryAfter: resetTime,
            };
        }

        // Add current request
        await cache.zadd(redisKey, now, `${now}-${Math.random()}`);

        // Set expiry on the key
        await cache.expire(redisKey, windowSeconds);

        const remaining = maxRequests - requestCount - 1;
        const resetTime = windowSeconds;

        return {
            success: true,
            limit: maxRequests,
            remaining,
            reset: resetTime,
        };
    } catch (error) {
        console.error('Rate limit error:', error);
        // On Redis error, allow the request
        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests,
            reset: config.windowSeconds,
        };
    }
}

/**
 * Rate limit by IP address
 * @param ip - Client IP address
 * @param config - Rate limit configuration (default: 100 req/min)
 * @returns Rate limit result
 */
export async function rateLimitByIP(
    ip: string,
    config: RateLimitConfig = { maxRequests: 100, windowSeconds: 60 }
): Promise<RateLimitResult> {
    return rateLimit(`ip:${ip}`, config);
}

/**
 * Rate limit by user ID
 * @param userId - User ID
 * @param config - Rate limit configuration (default: 300 req/min)
 * @returns Rate limit result
 */
export async function rateLimitByUser(
    userId: string,
    config: RateLimitConfig = { maxRequests: 300, windowSeconds: 60 }
): Promise<RateLimitResult> {
    return rateLimit(`user:${userId}`, config);
}

/**
 * Rate limit by custom key (e.g., action-specific limits)
 * @param action - Action identifier (e.g., 'post:create', 'comment:create')
 * @param identifier - User ID or IP
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function rateLimitByAction(
    action: string,
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    return rateLimit(`action:${action}:${identifier}`, config);
}

/**
 * Pre-configured rate limits for common actions
 */
export const RATE_LIMITS = {
    // General API limits
    general: {
        unauthenticated: { maxRequests: 100, windowSeconds: 60 }, // 100/min
        authenticated: { maxRequests: 300, windowSeconds: 60 }, // 300/min
    },

    // Post-related limits
    posts: {
        create: { maxRequests: 10, windowSeconds: 3600 }, // 10/hour
        update: { maxRequests: 20, windowSeconds: 3600 }, // 20/hour
        delete: { maxRequests: 20, windowSeconds: 3600 }, // 20/hour
    },

    // Comment limits
    comments: {
        create: { maxRequests: 50, windowSeconds: 3600 }, // 50/hour
        update: { maxRequests: 30, windowSeconds: 3600 }, // 30/hour
        delete: { maxRequests: 30, windowSeconds: 3600 }, // 30/hour
    },

    // Like/interaction limits
    interactions: {
        like: { maxRequests: 200, windowSeconds: 3600 }, // 200/hour
        bookmark: { maxRequests: 100, windowSeconds: 3600 }, // 100/hour
        follow: { maxRequests: 50, windowSeconds: 3600 }, // 50/hour
    },

    // Auth limits
    auth: {
        login: { maxRequests: 5, windowSeconds: 300 }, // 5 per 5 minutes
        register: { maxRequests: 3, windowSeconds: 3600 }, // 3/hour
        verifyOtp: { maxRequests: 5, windowSeconds: 600 }, // 5 per 10 minutes
    },

    // Search limits
    search: {
        query: { maxRequests: 30, windowSeconds: 60 }, // 30/min
    },
};

/**
 * Check if rate limit is exceeded
 * @param result - Rate limit result
 * @returns True if rate limit is exceeded
 */
export function isRateLimited(result: RateLimitResult): boolean {
    return !result.success;
}

/**
 * Get rate limit headers for HTTP response
 * @param result - Rate limit result
 * @returns Headers object
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
    };

    if (result.retryAfter !== undefined) {
        headers['Retry-After'] = String(result.retryAfter);
    }

    return headers;
}

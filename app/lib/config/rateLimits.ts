import type { RateLimitConfig } from "@/lib/utils/rateLimiter";

export interface RateLimitRegistry {
    general: {
        unauthenticated: RateLimitConfig;
        authenticated: RateLimitConfig;
    };
    posts: {
        create: RateLimitConfig;
        update: RateLimitConfig;
        delete: RateLimitConfig;
    };
    comments: {
        create: RateLimitConfig;
        update: RateLimitConfig;
        delete: RateLimitConfig;
    };
    interactions: {
        like: RateLimitConfig;
        bookmark: RateLimitConfig;
        follow: RateLimitConfig;
    };
    auth: {
        login: RateLimitConfig;
        register: RateLimitConfig;
        verifyOtp: RateLimitConfig;
    };
    search: {
        query: RateLimitConfig;
    };
}

export const RATE_LIMITS: RateLimitRegistry = {
    general: {
        unauthenticated: { maxRequests: 100, windowSeconds: 60 },
        authenticated: { maxRequests: 300, windowSeconds: 60 },
    },
    posts: {
        create: { maxRequests: 10, windowSeconds: 3600 },
        update: { maxRequests: 20, windowSeconds: 3600 },
        delete: { maxRequests: 20, windowSeconds: 3600 },
    },
    comments: {
        create: { maxRequests: 50, windowSeconds: 3600 },
        update: { maxRequests: 30, windowSeconds: 3600 },
        delete: { maxRequests: 30, windowSeconds: 3600 },
    },
    interactions: {
        like: { maxRequests: 200, windowSeconds: 3600 },
        bookmark: { maxRequests: 100, windowSeconds: 3600 },
        follow: { maxRequests: 50, windowSeconds: 3600 },
    },
    auth: {
        login: { maxRequests: 5, windowSeconds: 300 },
        register: { maxRequests: 3, windowSeconds: 3600 },
        verifyOtp: { maxRequests: 5, windowSeconds: 600 },
    },
    search: {
        query: { maxRequests: 30, windowSeconds: 60 },
    },
};

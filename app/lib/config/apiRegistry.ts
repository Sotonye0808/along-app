type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiEndpointMeta {
    path: string;
    method: HttpMethod;
    requiresAuth: boolean;
    cacheable?: boolean;
    rateLimitKey?: string;
}

export interface ApiRegistry {
    auth: {
        login: ApiEndpointMeta;
        register: ApiEndpointMeta;
        logout: ApiEndpointMeta;
        verifyOtp: ApiEndpointMeta;
        refresh: ApiEndpointMeta;
        verify: ApiEndpointMeta;
    };
    users: {
        list: ApiEndpointMeta;
        byId: ApiEndpointMeta;
        follow: ApiEndpointMeta;
    };
    posts: {
        list: ApiEndpointMeta;
        byId: ApiEndpointMeta;
        like: ApiEndpointMeta;
        bookmark: ApiEndpointMeta;
        comments: ApiEndpointMeta;
    };
    notifications: {
        list: ApiEndpointMeta;
        byId: ApiEndpointMeta;
        subscribe: ApiEndpointMeta;
        unsubscribe: ApiEndpointMeta;
    };
}

export const API_REGISTRY: ApiRegistry = {
    auth: {
        login: { path: "/api/auth/login", method: "POST", requiresAuth: false, rateLimitKey: "auth.login" },
        register: { path: "/api/auth/register", method: "POST", requiresAuth: false, rateLimitKey: "auth.register" },
        logout: { path: "/api/auth/logout", method: "POST", requiresAuth: true },
        verifyOtp: { path: "/api/auth/verify-otp", method: "POST", requiresAuth: false, rateLimitKey: "auth.verifyOtp" },
        refresh: { path: "/api/auth/refresh", method: "POST", requiresAuth: false },
        verify: { path: "/api/auth/verify", method: "GET", requiresAuth: true, cacheable: false },
    },
    users: {
        list: { path: "/api/users", method: "GET", requiresAuth: true, cacheable: true, rateLimitKey: "search.query" },
        byId: { path: "/api/users/:id", method: "GET", requiresAuth: true, cacheable: true },
        follow: { path: "/api/users/:id/follow", method: "POST", requiresAuth: true, rateLimitKey: "interactions.follow" },
    },
    posts: {
        list: { path: "/api/posts", method: "GET", requiresAuth: true, cacheable: true, rateLimitKey: "general.authenticated" },
        byId: { path: "/api/posts/:id", method: "GET", requiresAuth: true, cacheable: true },
        like: { path: "/api/posts/:id/like", method: "POST", requiresAuth: true, rateLimitKey: "interactions.like" },
        bookmark: { path: "/api/posts/:id/bookmark", method: "POST", requiresAuth: true, rateLimitKey: "interactions.bookmark" },
        comments: { path: "/api/posts/:id/comments", method: "POST", requiresAuth: true, rateLimitKey: "comments.create" },
    },
    notifications: {
        list: { path: "/api/notifications", method: "GET", requiresAuth: true, cacheable: true },
        byId: { path: "/api/notifications/:id", method: "PATCH", requiresAuth: true },
        subscribe: { path: "/api/notifications/subscribe", method: "POST", requiresAuth: true },
        unsubscribe: { path: "/api/notifications/unsubscribe", method: "POST", requiresAuth: true },
    },
};

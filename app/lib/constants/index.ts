// API Configuration
// Uses Next.js API routes by default, can be overridden with NEXT_PUBLIC_API_URL for production backend
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VERIFY_OTP: '/auth/verify-otp',
  REFRESH_TOKEN: '/auth/refresh',
  VERIFY: '/auth/verify',

  // Users
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_POSTS: (id: string) => `/users/${id}/posts`,
  USER_BOOKMARKS: (id: string) => `/users/${id}/bookmarks`,
  USER_FOLLOW: (id: string) => `/users/${id}/follow`,

  // Posts
  POSTS: "/posts",
  POST_BY_ID: (id: string) => `/posts/${id}`,
  POST_LIKE: (id: string) => `/posts/${id}/like`,
  POST_LIKE_CHECK: (id: string, userId: string) => `/posts/${id}/like?userId=${userId}`,
  POST_DISLIKE: (id: string) => `/posts/${id}/dislike`,
  POST_COMMENTS: (id: string) => `/posts/${id}/comments`,
  POST_COMMENT_LIKE: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}/like`,
  POST_COMMENT_DISLIKE: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}/dislike`,
  POST_BOOKMARK: (id: string) => `/posts/${id}/bookmark`,
  POST_SHARE: (id: string) => `/posts/${id}/share`,

  // Notifications
  NOTIFICATIONS: "/notifications",

  // Rewards
  USER_REWARDS: (id: string) => `/users/${id}/rewards`,

  // Invites
  INVITES: "/invites",
  INVITE_VALIDATE: (code: string) => `/invites/${code}`,

  // Analytics
  ANALYTICS: "/analytics",

  // Reviews (user-facing)
  REVIEWS_USER: "/reviews/user",
} as const;

// App Routes
export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  OTP: "/otp",
  DASHBOARD: "/home",
  EXPLORE: "/explore",
  BOOKMARKS: "/bookmarks",
  MARKETPLACE: "/marketplace",
  PROFILE: "/profile",
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
} as const;

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: "#00623B",
  SUCCESS: "#a4f4e7",
  WARNING: "#f4c790",
  ERROR: "#e4626f",
  BASE_BG: "#f7f7f7",
  BASE_TEXT: "#232323",
} as const;

// Validation Rules
export const VALIDATION = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  PASSWORD_MIN: 8,
  OTP_LENGTH: 6,
} as const;

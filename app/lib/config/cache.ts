export const CACHE_TTL = {
  feed: 300,
  post: 600,
  userProfile: 300,
  suggestions: 1800,
  validity: 1800,
  searchResults: 120,
  leaderboard: 600,
  siteConfig: 3600,
  notifications: 60,
  analytics: 3600,
} as const;

export const CACHE_KEYS = {
  feed: (userId: string, cursor?: string) => `feed:${userId}:${cursor ?? "start"}`,
  post: (postId: string) => `post:${postId}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  suggestions: (userId: string) => `suggestions:${userId}`,
  validity: (postId: string) => `validity:${postId}`,
  search: (query: string, type: string) => `search:${type}:${query.toLowerCase()}`,
  leaderboard: () => "leaderboard:invites",
  siteConfig: (key: string) => `siteConfig:${key}`,
  notifications: (userId: string) => `notifications:${userId}:unread`,
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
} as const;

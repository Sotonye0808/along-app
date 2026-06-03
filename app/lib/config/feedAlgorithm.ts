import type { FeedAlgorithmConfig } from "@/app/lib/types";

export const DEFAULT_FEED_CONFIG: FeedAlgorithmConfig = {
  followingWeight: 0.7,
  matchingTagsWeight: 0.2,
  trendingWeight: 0.1,
  locationBonus: 0.15,
  cacheTtlSeconds: 300,
  pageSize: 10,
};

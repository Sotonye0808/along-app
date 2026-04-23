export interface FeedAlgorithmConfig {
    freshnessWeight: number;
    trustWeight: number;
    interactionWeight: number;
    followingBoost: number;
    proximityBoost: number;
    verifiedBoost: number;
    maxAgeHours: number;
}

export const DEFAULT_FEED_CONFIG: FeedAlgorithmConfig = {
    freshnessWeight: 0.35,
    trustWeight: 0.2,
    interactionWeight: 0.2,
    followingBoost: 0.12,
    proximityBoost: 0.08,
    verifiedBoost: 0.05,
    maxAgeHours: 72,
};

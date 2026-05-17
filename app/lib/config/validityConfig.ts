export interface ValidityConfig {
    weights: {
        likeRatio: number;
        detailScore: number;
        similarityRatio: number;
        recency: number;
    };
    thresholds: {
        low: number;
        medium: number;
        high: number;
        trusted: number;
    };
}

export const DEFAULT_VALIDITY_CONFIG: ValidityConfig = {
    weights: {
        likeRatio: 0.35,
        detailScore: 0.25,
        similarityRatio: 0.2,
        recency: 0.2,
    },
    thresholds: {
        low: 30,
        medium: 60,
        high: 80,
        trusted: 90,
    },
};

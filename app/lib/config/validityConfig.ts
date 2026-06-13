import type { ValidityConfig } from "@/app/lib/types";

export const DEFAULT_VALIDITY_CONFIG: ValidityConfig = {
  likeRatioWeight: 0.35,
  detailScoreWeight: 0.35,
  similarityRatioWeight: 0.2,
  recencyWeight: 0.1,
  minScoreForVerified: 60,
  minScoreForTrusted: 80,
  cacheTtlSeconds: 1800,
};

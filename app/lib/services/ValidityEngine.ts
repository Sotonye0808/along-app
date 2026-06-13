import { DEFAULT_VALIDITY_CONFIG } from "@/app/lib/config/validityConfig";

interface ValidityInput {
  likes: number;
  dislikes: number;
  routeDetailScore: number; // 0-100 based on how detailed the route is
  similarityRatio: number;  // 0-100 how unique this is vs other posts
  createdAt: Date;
}

interface ValidityResult {
  score: number;
  tier: "low" | "developing" | "verified" | "trusted";
  community: number;
  detail: number;
  corroboration: number;
  recency: number;
}

class ValidityEngine {
  async evaluate(input: ValidityInput): Promise<ValidityResult> {
    // Calculate individual components
    const totalInteractions = input.likes + input.dislikes;
    const likeRatio = totalInteractions > 0
      ? (input.likes / totalInteractions) * 100
      : 0;

    const community = Math.round(likeRatio);
    const detail = Math.min(100, input.routeDetailScore);
    const corroboration = Math.min(100, input.similarityRatio);

    // Recency: posts within 24h get 100, decreasing to 0 over 30 days
    const ageMs = Date.now() - new Date(input.createdAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const recency = Math.max(0, Math.round(100 - (ageDays / 30) * 100));

    const config = DEFAULT_VALIDITY_CONFIG;
    const score = Math.round(
      community * config.likeRatioWeight +
      detail * config.detailScoreWeight +
      corroboration * config.similarityRatioWeight +
      recency * config.recencyWeight
    );

    const clampedScore = Math.min(100, Math.max(0, score));

    let tier: ValidityResult["tier"] = "low";
    if (clampedScore >= config.minScoreForTrusted) tier = "trusted";
    else if (clampedScore >= config.minScoreForVerified) tier = "verified";
    else if (clampedScore >= 30) tier = "developing";

    return { score: clampedScore, tier, community, detail, corroboration, recency };
  }

  getTrustLevel(score: number): ValidityResult["tier"] {
    const config = DEFAULT_VALIDITY_CONFIG;
    if (score >= config.minScoreForTrusted) return "trusted";
    if (score >= config.minScoreForVerified) return "verified";
    if (score >= 30) return "developing";
    return "low";
  }
}

export const validityEngine = new ValidityEngine();

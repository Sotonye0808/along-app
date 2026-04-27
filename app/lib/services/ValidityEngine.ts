import { DEFAULT_VALIDITY_CONFIG } from "@/lib/config/validityConfig";
import type { ValidityConfig } from "@/lib/config/validityConfig";

export interface ValidityBreakdown {
  likeRatio: number;
  detailScore: number;
  similarityRatio: number;
  recency: number;
  total: number;
}

/**
 * ValidityEngine
 *
 * Computes a 0–100 validity/trust score for a post based on four weighted
 * sub-computations. Config is injected at construction time so it can be
 * driven by the admin-adjustable SiteConfig record.
 */
export class ValidityEngine {
  private readonly config: ValidityConfig;

  constructor(config: ValidityConfig = DEFAULT_VALIDITY_CONFIG) {
    this.config = config;
  }

  /**
   * Like ratio: proportion of positive reactions (0–100).
   * Returns 50 when there are no reactions (neutral default).
   */
  computeLikeRatio(post: Pick<Post, "likes" | "dislikes">): number {
    const total = post.likes + post.dislikes;
    if (total === 0) {
      return 50;
    }
    return Math.round((post.likes / total) * 100);
  }

  /**
   * Detail score: quality signal based on route text, step count, images,
   * and external links (0–100).
   */
  computeDetailScore(
    post: Pick<Post, "routes" | "images"> & { description?: string },
  ): number {
    let score = 0;

    // Each route step with meaningful text (≥20 chars) adds up to 30 points
    const informativeSteps = post.routes.filter(
      (r) => r.text && r.text.trim().length >= 20,
    ).length;
    score += Math.min(informativeSteps * 10, 30);

    // Having at least 2 steps: +10
    if (post.routes.length >= 2) {
      score += 10;
    }

    // Each image adds up to 25 points
    score += Math.min(post.images.length * 10, 25);

    // External links on routes
    const totalLinks = post.routes.reduce((n, r) => n + r.links.length, 0);
    score += Math.min(totalLinks * 5, 15);

    // Vehicles specified: +10
    const hasVehicles = post.routes.some((r) => r.vehicles.length > 0);
    if (hasVehicles) {
      score += 10;

      // Fare information: +10
      const hasFare = post.routes.some((r) => typeof r.fare === "number");
      if (hasFare) {
        score += 10;
      }
    }

    return Math.min(score, 100);
  }

  /**
   * Similarity ratio: how closely the post matches a set of related posts
   * on tags and route structure (0–100).
   *
   * When no related posts are provided, returns a neutral 50.
   */
  computeSimilarityRatio(
    post: Pick<Post, "tags" | "routes">,
    relatedPosts: Pick<Post, "tags" | "routes">[],
  ): number {
    if (relatedPosts.length === 0) {
      return 50;
    }

    const postTagSet = new Set(post.tags.map((t) => t.toLowerCase()));
    const postStepCount = post.routes.length;

    const similarities = relatedPosts.map((related) => {
      const relatedTagSet = new Set(
        related.tags.map((t) => t.toLowerCase()),
      );
      const intersection = [...postTagSet].filter((t) =>
        relatedTagSet.has(t),
      ).length;
      const union = new Set([...postTagSet, ...relatedTagSet]).size;
      const tagSimilarity = union === 0 ? 0 : intersection / union;

      const stepSimilarity =
        postStepCount === 0
          ? 0
          : 1 -
            Math.abs(postStepCount - related.routes.length) / postStepCount;

      return (tagSimilarity + Math.max(stepSimilarity, 0)) / 2;
    });

    const avgSimilarity =
      similarities.reduce((a, b) => a + b, 0) / similarities.length;
    return Math.round(avgSimilarity * 100);
  }

  /**
   * Recency: time-decay signal (0–100). A post created now scores 100.
   * Decays linearly over 30 days to 0.
   */
  computeRecency(post: Pick<Post, "createdAt">): number {
    const maxAgeDays = 30;
    const createdAt = new Date(post.createdAt).getTime();
    const ageMs = Date.now() - createdAt;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const score = Math.max(0, 1 - ageDays / maxAgeDays) * 100;
    return Math.round(score);
  }

  /**
   * Full validity score: weighted combination of the four sub-scores (0–100).
   */
  evaluate(
    post: Pick<Post, "likes" | "dislikes" | "routes" | "images" | "tags" | "createdAt"> & {
      description?: string;
    },
    relatedPosts: Pick<Post, "tags" | "routes">[] = [],
  ): ValidityBreakdown {
    const { weights } = this.config;

    const likeRatio = this.computeLikeRatio(post);
    const detailScore = this.computeDetailScore(post);
    const similarityRatio = this.computeSimilarityRatio(post, relatedPosts);
    const recency = this.computeRecency(post);

    const total = Math.round(
      likeRatio * weights.likeRatio +
        detailScore * weights.detailScore +
        similarityRatio * weights.similarityRatio +
        recency * weights.recency,
    );

    return {
      likeRatio,
      detailScore,
      similarityRatio,
      recency,
      total: Math.min(total, 100),
    };
  }

  /**
   * Convenience wrapper: returns only the composite score.
   */
  getScore(
    post: Parameters<ValidityEngine["evaluate"]>[0],
    relatedPosts?: Parameters<ValidityEngine["evaluate"]>[1],
  ): number {
    return this.evaluate(post, relatedPosts).total;
  }

  /**
   * Determine the validity tier label from a score.
   */
  getTier(score: number): string {
    const { thresholds } = this.config;
    if (score >= thresholds.trusted) return "trusted";
    if (score >= thresholds.high) return "high";
    if (score >= thresholds.medium) return "medium";
    return "low";
  }
}

/** Pre-built engine with default config for quick import. */
export const validityEngine = new ValidityEngine();

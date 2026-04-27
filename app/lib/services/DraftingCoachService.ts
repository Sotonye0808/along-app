import {
  QUALITY_CHECKPOINTS,
  type QualityCheckpoint,
} from "@/lib/config/draftingCoach";

export interface DraftState {
  title?: string;
  routes: Array<{
    text?: string;
    vehicles?: string[];
    fare?: number;
    links?: { text: string; url: string }[];
  }>;
  images?: string[];
}

export interface CheckpointResult {
  checkpoint: QualityCheckpoint;
  passed: boolean;
}

export interface CoachEvaluation {
  score: number;
  results: CheckpointResult[];
  nextSuggestion: QualityCheckpoint | null;
  allPassed: boolean;
}

/**
 * DraftingCoachService
 *
 * Evaluates a post draft against the QUALITY_CHECKPOINTS registry and
 * returns a score, per-checkpoint status, and the next actionable suggestion.
 */
export class DraftingCoachService {
  private readonly checkpoints: QualityCheckpoint[];

  constructor(checkpoints: QualityCheckpoint[] = QUALITY_CHECKPOINTS) {
    this.checkpoints = checkpoints;
  }

  evaluate(draft: DraftState): CoachEvaluation {
    const results: CheckpointResult[] = this.checkpoints.map((checkpoint) => ({
      checkpoint,
      passed: this.checkPassesCheckpoint(checkpoint.key, draft),
    }));

    const totalPoints = this.checkpoints.reduce(
      (sum, cp) => sum + cp.points,
      0,
    );
    const earnedPoints = results
      .filter((r) => r.passed)
      .reduce((sum, r) => sum + r.checkpoint.points, 0);

    const score =
      totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);

    const nextSuggestion = this.getNextSuggestion(results);
    const allPassed = results.every((r) => r.passed);

    return { score, results, nextSuggestion, allPassed };
  }

  getScore(draft: DraftState): number {
    return this.evaluate(draft).score;
  }

  getNextSuggestion(results: CheckpointResult[]): QualityCheckpoint | null {
    const firstFailed = results.find((r) => !r.passed);
    return firstFailed ? firstFailed.checkpoint : null;
  }

  private checkPassesCheckpoint(key: string, draft: DraftState): boolean {
    switch (key) {
      case "originDestination": {
        const hasOrigin =
          draft.routes.length > 0 &&
          typeof draft.routes[0]?.text === "string" &&
          draft.routes[0].text.trim().length > 0;
        const hasDestination =
          draft.routes.length > 1 &&
          typeof draft.routes[draft.routes.length - 1]?.text === "string" &&
          draft.routes[draft.routes.length - 1].text!.trim().length > 0;
        return hasOrigin && hasDestination;
      }
      case "transportMode": {
        return draft.routes.some(
          (r) => Array.isArray(r.vehicles) && r.vehicles.length > 0,
        );
      }
      case "routeNarrative": {
        return draft.routes.some(
          (r) =>
            typeof r.text === "string" &&
            r.text.trim().split(/\s+/).length >= 10,
        );
      }
      case "photoEvidence": {
        return Array.isArray(draft.images) && draft.images.length > 0;
      }
      default:
        return false;
    }
  }
}

export const draftingCoachService = new DraftingCoachService();

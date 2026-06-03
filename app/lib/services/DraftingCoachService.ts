import { QUALITY_CHECKPOINTS } from "@/app/lib/config/draftingCoach";

interface DraftInput {
  title?: string;
  steps?: { location?: string; description?: string; fare?: number; vehicle?: string }[];
  images?: string[];
  tags?: string[];
  description?: string;
}

interface CheckpointResult {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
}

interface DraftEvaluation {
  score: number;
  maxScore: number;
  checkpoints: CheckpointResult[];
  passedCount: number;
  totalCount: number;
  nextSuggestion: string | null;
}

class DraftingCoachService {
  evaluate(draft: DraftInput): DraftEvaluation {
    const checkpoints: CheckpointResult[] = QUALITY_CHECKPOINTS.map((cp) => ({
      id: cp.id,
      label: cp.label,
      passed: cp.validate(draft as Record<string, unknown>),
      weight: cp.weight,
    }));

    const maxScore = checkpoints.reduce((sum, cp) => sum + cp.weight, 0);
    const score = checkpoints
      .filter((cp) => cp.passed)
      .reduce((sum, cp) => sum + cp.weight, 0);

    const passedCount = checkpoints.filter((cp) => cp.passed).length;
    const failed = checkpoints.find((cp) => !cp.passed);

    return {
      score,
      maxScore,
      checkpoints,
      passedCount,
      totalCount: checkpoints.length,
      nextSuggestion: failed ? `Add: ${failed.label}` : null,
    };
  }

  getScore(draft: DraftInput): number {
    return this.evaluate(draft).score;
  }

  getNextSuggestion(draft: DraftInput): string | null {
    return this.evaluate(draft).nextSuggestion;
  }
}

export const draftingCoachService = new DraftingCoachService();

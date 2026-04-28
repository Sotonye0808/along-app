"use client";

import React, { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { DraftingCoachService } from "@/lib/services/DraftingCoachService";
import type { DraftState } from "@/lib/services/DraftingCoachService";
import { AppAlert } from "@/components/ui/AppAlert";
import { AppProgress } from "@/components/ui/AppProgress";
import { AppTag } from "@/components/ui/AppTag";

interface DraftingCoachProps {
  draft: DraftState;
  className?: string;
}

const coachService = new DraftingCoachService();

export function DraftingCoach({
  draft,
  className,
}: DraftingCoachProps): React.ReactElement {
  const evaluation = useMemo(
    () => coachService.evaluate(draft),
    [draft],
  );

  const { score, results, nextSuggestion, allPassed } = evaluation;

  return (
    <div className={["space-y-3", className ?? ""].join(" ").trim()}>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Route quality
          </span>
          <AppTag
            label={`${score}%`}
            variant={
              score >= 80
                ? "success"
                : score >= 50
                  ? "warning"
                  : "error"
            }
            size="xs"
          />
        </div>
        <AppProgress percent={score} size="small" showInfo={false} />
      </div>

      <div className="space-y-1.5">
        {results.map(({ checkpoint, passed }) => {
          const Icon = passed ? CheckCircle2 : Circle;
          return (
            <div
              key={checkpoint.key}
              className="flex items-start gap-2 text-sm">
              <Icon
                size={16}
                className={
                  passed
                    ? "mt-0.5 shrink-0 text-[var(--color-success-text)]"
                    : "mt-0.5 shrink-0 text-[var(--color-text-muted)]"
                }
                aria-hidden="true"
              />
              <div className="min-w-0">
                <span
                  className={
                    passed
                      ? "text-[var(--color-text-secondary)] line-through"
                      : "text-[var(--color-text-primary)]"
                  }>
                  {checkpoint.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {allPassed ? (
        <AppAlert
          type="success"
          message="Your route is well-documented and ready to share!"
          showIcon
        />
      ) : nextSuggestion ? (
        <AppAlert
          type="info"
          message={nextSuggestion.description}
          showIcon
        />
      ) : null}
    </div>
  );
}

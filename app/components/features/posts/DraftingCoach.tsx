"use client";

import React, { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { DraftingCoachService } from "@/lib/services/DraftingCoachService";
import type { DraftState } from "@/lib/services/DraftingCoachService";
import { AppAlert } from "@/components/ui/AppAlert";
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
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
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
        <div className="h-2 w-full rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-success)] transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {results.map(({ checkpoint, passed }, idx) => {
          const Icon = passed ? CheckCircle2 : Circle;
          return (
            <div
              key={checkpoint.key}
              className="flex items-start gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <div className={[
                  "flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium",
                  passed
                    ? "bg-[var(--color-success)] text-white"
                    : idx < results.filter(r => r.passed).length
                      ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
                      : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
                ].join(" ")}>
                  {passed ? <CheckCircle2 size={12} /> : idx + 1}
                </div>
                <Icon
                  size={16}
                  className={
                    passed
                      ? "shrink-0 text-[var(--color-success-text)]"
                      : "shrink-0 text-[var(--color-text-muted)]"
                  }
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={
                    passed
                      ? "text-[var(--color-text-muted)] line-through"
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

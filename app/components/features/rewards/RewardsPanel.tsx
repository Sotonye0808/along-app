"use client";

import React from "react";
import { Award, ChevronRight, Star, Zap } from "lucide-react";
import { AppCard } from "@/components/ui/AppCard";
import { AppProgress } from "@/components/ui/AppProgress";
import { AppTag } from "@/components/ui/AppTag";
import { REWARD_TIERS, type RewardTier } from "@/lib/config/rewards";

export interface RewardsSummaryData {
  rewardPoints: number;
  rewardTier: RewardTier;
  nextTier: RewardTier | null;
  pointsToNextTier: number | null;
  progressPercent: number;
}

interface RewardsPanelProps {
  data: RewardsSummaryData;
  className?: string;
}

const TIER_ICON_STYLES: Record<
  string,
  { text: string; bg: string; fill: string }
> = {
  bronze: {
    text: "text-[var(--color-warning-text)]",
    bg: "bg-[var(--color-warning-text)]/15",
    fill: "fill-[var(--color-warning-text)]",
  },
  silver: {
    text: "text-[var(--color-success-text)]",
    bg: "bg-[var(--color-success-text)]/15",
    fill: "fill-[var(--color-success-text)]",
  },
  gold: {
    text: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary)]/15",
    fill: "fill-[var(--color-primary)]",
  },
  platinum: {
    text: "text-[var(--color-primary-dark)]",
    bg: "bg-[var(--color-primary-dark)]/15",
    fill: "fill-[var(--color-primary-dark)]",
  },
};

export function RewardsPanel({
  data,
  className,
}: RewardsPanelProps): React.ReactElement {
  const {
    rewardPoints,
    rewardTier,
    nextTier,
    pointsToNextTier,
    progressPercent,
  } = data;
  const iconStyles = TIER_ICON_STYLES[rewardTier.key] ?? TIER_ICON_STYLES.gold;

  return (
    <AppCard variant="elevated" className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className={[
              "flex h-10 w-10 items-center justify-center rounded-full",
              iconStyles.bg,
            ]
              .join(" ")
              .trim()}>
            <Award size={20} className={iconStyles.text} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] leading-tight">
              Your Rewards
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Earn points by contributing routes
            </p>
          </div>
        </div>

        {/* Points + Tier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star
              size={16}
              className={[iconStyles.text, iconStyles.fill].join(" ")}
              aria-hidden="true"
            />
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {rewardPoints.toLocaleString()}
            </span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              pts
            </span>
          </div>
          <AppTag
            label={rewardTier.badgeLabel}
            variant="primary"
            size="sm"
            icon={Award}
          />
        </div>

        {/* Progress to next tier */}
        {nextTier ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span className={["font-medium", iconStyles.text].join(" ")}>
                {rewardTier.label}
              </span>
              <span className="flex items-center gap-1">
                <ChevronRight size={12} aria-hidden="true" />
                {nextTier.label} ({pointsToNextTier?.toLocaleString()} pts away)
              </span>
            </div>
            <AppProgress percent={progressPercent} size="small" />
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-success-bg)] px-3 py-2">
            <Zap
              size={14}
              className="text-[var(--color-success-text)]"
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-[var(--color-success-text)]">
              You&apos;ve reached the highest tier!
            </span>
          </div>
        )}

        {/* Tier breakdown */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          {REWARD_TIERS.map((tier) => {
            const isActive = rewardPoints >= tier.minPoints;
            const isCurrent = tier.key === rewardTier.key;
            return (
              <div
                key={tier.key}
                className={[
                  "flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-center",
                  isActive ? "bg-[var(--color-bg-elevated)]" : "opacity-40",
                  isCurrent ? "ring-1 ring-[var(--color-primary)]/40" : "",
                ].join(" ")}>
                <span
                  className={[
                    "text-[10px] font-semibold uppercase tracking-wide",
                    isActive
                      ? tier.colorClass
                      : "text-[var(--color-text-muted)]",
                  ]
                    .join(" ")
                    .trim()}>
                  {tier.label}
                </span>
                <span className="text-[9px] text-[var(--color-text-secondary)]">
                  {tier.minPoints === 0 ? "Start" : `${tier.minPoints}+`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AppCard>
  );
}

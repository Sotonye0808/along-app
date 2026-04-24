"use client";

import React from "react";
import { AlertTriangle, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppTag } from "./AppTag";
import { AppTooltip } from "./AppTooltip";
import { AppProgress } from "./AppProgress";

export interface TrustBreakdown {
  likeRatio: number;
  detailScore: number;
  similarityRatio: number;
  recency: number;
}

export interface TrustBadgeProps {
  score: number;
  breakdown?: TrustBreakdown;
}

function getTrustMeta(score: number): {
  label: string;
  Icon: LucideIcon;
  variant: "error" | "warning" | "success" | "primary";
} {
  if (score < 30) {
    return { label: "Low", Icon: AlertTriangle, variant: "error" };
  }
  if (score < 60) {
    return { label: "Developing", Icon: Clock, variant: "warning" };
  }
  if (score < 80) {
    return { label: "Verified", Icon: CheckCircle, variant: "success" };
  }
  return { label: "Trusted", Icon: ShieldCheck, variant: "primary" };
}

export function TrustBadge({
  score,
  breakdown,
}: TrustBadgeProps): React.ReactElement {
  const { label, Icon, variant } = getTrustMeta(score);

  const tooltip = breakdown ? (
    <div className="w-52 space-y-2 text-xs">
      <div>
        Like Ratio <AppProgress percent={breakdown.likeRatio} size="small" />
      </div>
      <div>
        Detail Score{" "}
        <AppProgress percent={breakdown.detailScore} size="small" />
      </div>
      <div>
        Similarity Ratio{" "}
        <AppProgress percent={breakdown.similarityRatio} size="small" />
      </div>
      <div>
        Recency <AppProgress percent={breakdown.recency} size="small" />
      </div>
    </div>
  ) : (
    <span>{label} trust score</span>
  );

  return (
    <AppTooltip title={tooltip}>
      <span>
        <AppTag
          label={`${label} ${score}%`}
          icon={Icon}
          variant={variant}
          pill
        />
      </span>
    </AppTooltip>
  );
}

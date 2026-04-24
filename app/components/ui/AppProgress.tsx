"use client";

import React from "react";
import { Progress } from "antd";
import type { ProgressProps } from "antd";

export interface AppProgressProps {
  percent: number;
  size?: ProgressProps["size"];
  showInfo?: boolean;
  status?: ProgressProps["status"];
  className?: string;
}

export function AppProgress({
  percent,
  size = "default",
  showInfo = false,
  status,
  className,
}: AppProgressProps): React.ReactElement {
  return (
    <Progress
      percent={percent}
      size={size}
      showInfo={showInfo}
      status={status}
      strokeColor="var(--color-primary)"
      className={className}
    />
  );
}

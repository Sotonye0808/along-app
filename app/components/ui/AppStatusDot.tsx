"use client";

import React from "react";

export interface StatusDotConfig {
  color: string;
  label: string;
}

export interface AppStatusDotProps {
  status: string;
  configMap: Record<string, StatusDotConfig>;
  className?: string;
}

export function AppStatusDot({
  status,
  configMap,
  className,
}: AppStatusDotProps): React.ReactElement {
  const config = configMap[status] ?? { color: "#9ca3af", label: status };

  return (
    <span
      className={["inline-flex items-center gap-1.5 text-xs", className ?? ""]
        .join(" ")
        .trim()}>
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: config.color }}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
}

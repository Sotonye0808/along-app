"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface AppSpinnerProps {
  size?: number;
  className?: string;
}

export function AppSpinner({
  size = 18,
  className,
}: AppSpinnerProps): React.ReactElement {
  return (
    <Loader2
      size={size}
      className={["animate-spin", className ?? ""].join(" ").trim()}
      aria-hidden="true"
    />
  );
}

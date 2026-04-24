"use client";

import React from "react";
import { AppSpinner } from "./AppSpinner";

export interface AppPageLoaderProps {
  message?: string;
}

export function AppPageLoader({
  message = "Loading...",
}: AppPageLoaderProps): React.ReactElement {
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center">
      <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
        <AppSpinner size={22} />
        <span>{message}</span>
      </div>
    </div>
  );
}

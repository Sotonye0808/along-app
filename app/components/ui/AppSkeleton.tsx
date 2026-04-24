"use client";

import React from "react";
import { Skeleton } from "antd";

export interface AppSkeletonProps {
  active?: boolean;
  className?: string;
}

export function AppSkeleton({
  active = true,
  className,
}: AppSkeletonProps): React.ReactElement {
  return <Skeleton active={active} className={className} />;
}

export function PostCardSkeleton(): React.ReactElement {
  return (
    <Skeleton
      active
      avatar
      paragraph={{ rows: 4 }}
      className="rounded-[var(--radius-card)]"
    />
  );
}

export function UserCardSkeleton(): React.ReactElement {
  return <Skeleton active avatar paragraph={{ rows: 2 }} />;
}

export function TableRowSkeleton(): React.ReactElement {
  return <Skeleton active paragraph={{ rows: 1 }} title={false} />;
}

export function StatCardSkeleton(): React.ReactElement {
  return <Skeleton active paragraph={{ rows: 1 }} />;
}

export function MapSkeleton(): React.ReactElement {
  return (
    <div
      className="h-64 w-full rounded-[var(--radius-card)] bg-[var(--color-bg-elevated)] animate-pulse"
      aria-label="Loading map"
    />
  );
}

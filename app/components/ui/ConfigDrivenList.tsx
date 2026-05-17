"use client";

import React from "react";
import { AppEmptyState } from "./AppEmptyState";
import { AppPagination } from "./AppPagination";

export interface ConfigDrivenListProps<T> {
  items: T[];
  loading?: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  skeleton?: React.ReactNode;
  emptyState?: {
    title: string;
    description?: string;
  };
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  className?: string;
}

export function ConfigDrivenList<T>({
  items,
  loading,
  renderItem,
  skeleton,
  emptyState,
  pagination,
  className,
}: ConfigDrivenListProps<T>): React.ReactElement {
  if (loading) {
    return (
      <>
        {skeleton ?? (
          <div className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
            Loading...
          </div>
        )}
      </>
    );
  }

  if (items.length === 0) {
    return (
      <AppEmptyState
        title={emptyState?.title ?? "Nothing to show"}
        description={emptyState?.description}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
        ))}
      </div>
      {pagination ? (
        <AppPagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={pagination.onChange}
        />
      ) : null}
    </div>
  );
}

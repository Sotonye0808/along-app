"use client";

import React from "react";
import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";

export interface AppPaginationConfig {
  current?: number;
  pageSize?: number;
  total?: number;
  onChange?: (page: number, pageSize: number) => void;
}

export interface TableEmptyStateConfig {
  title: string;
  description?: string;
}

export interface AppTableColumn<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
}

export interface AppTableProps<T extends object> {
  columns: AppTableColumn<T>[];
  data: T[];
  loading?: boolean;
  rowKey: keyof T | ((row: T) => string);
  onRowClick?: (row: T) => void;
  rowHref?: (row: T) => string;
  pagination?: AppPaginationConfig | false;
  emptyState?: TableEmptyStateConfig;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  size?: "small" | "default";
  stickyHeader?: boolean;
  className?: string;
}

export function AppTable<T extends object>({
  columns,
  data,
  loading,
  rowKey,
  onRowClick,
  rowHref,
  pagination,
  emptyState,
  selectable,
  onSelectionChange,
  size = "default",
  stickyHeader,
  className,
}: AppTableProps<T>): React.ReactElement {
  const mappedColumns: TableColumnsType<T> = columns.map((column) => ({
    key: column.key,
    title: column.title,
    dataIndex: column.dataIndex as string | undefined,
    render: column.render,
    sorter: column.sortable,
    width: column.width,
    align: column.align,
    fixed: column.fixed,
  }));

  const rowSelection: TableProps<T>["rowSelection"] = selectable
    ? {
        onChange: (_, selectedRows) => onSelectionChange?.(selectedRows),
      }
    : undefined;

  return (
    <Table<T>
      rowKey={rowKey as TableProps<T>["rowKey"]}
      columns={mappedColumns}
      dataSource={data}
      loading={loading}
      pagination={pagination === false ? false : pagination}
      size={size === "small" ? "small" : "middle"}
      sticky={stickyHeader}
      rowSelection={rowSelection}
      locale={
        emptyState
          ? {
              emptyText: (
                <div className="py-6 text-center">
                  <div className="font-medium">{emptyState.title}</div>
                  {emptyState.description ? (
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      {emptyState.description}
                    </div>
                  ) : null}
                </div>
              ),
            }
          : undefined
      }
      onRow={(record) => ({
        onClick: () => {
          if (onRowClick) {
            onRowClick(record);
            return;
          }
          if (rowHref) {
            window.location.href = rowHref(record);
          }
        },
        style: rowHref || onRowClick ? { cursor: "pointer" } : undefined,
      })}
      className={className}
    />
  );
}

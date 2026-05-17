"use client";

import React from "react";
import { Pagination } from "antd";
import type { PaginationProps } from "antd";

export type AppPaginationProps = PaginationProps;

export function AppPagination(props: AppPaginationProps): React.ReactElement {
  return (
    <Pagination
      {...props}
      showSizeChanger={props.showSizeChanger ?? true}
      pageSizeOptions={props.pageSizeOptions ?? ["10", "20", "50"]}
      className={["!mt-4", props.className ?? ""].join(" ").trim()}
    />
  );
}

"use client";

import React from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";

export type AppSelectProps<ValueType = unknown> = SelectProps<ValueType>;

export function AppSelect<ValueType = unknown>(
  props: AppSelectProps<ValueType>,
): React.ReactElement {
  return (
    <Select<ValueType>
      {...props}
      className={[
        "[&_.ant-select-selector]:!rounded-[var(--radius-input)] [&_.ant-select-selector]:!border-[var(--color-border)]",
        props.className ?? "",
      ]
        .join(" ")
        .trim()}
    />
  );
}

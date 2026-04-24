"use client";

import React from "react";
import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input";

export type AppTextareaProps = TextAreaProps;

export function AppTextarea(props: AppTextareaProps): React.ReactElement {
  return (
    <Input.TextArea
      {...props}
      className={[
        "!rounded-[var(--radius-input)] focus:!border-[var(--color-primary)]",
        props.className ?? "",
      ]
        .join(" ")
        .trim()}
    />
  );
}

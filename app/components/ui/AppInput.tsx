"use client";

import React from "react";
import { Input } from "antd";
import type { InputProps } from "antd";

export type AppInputProps = InputProps;

export function AppInput(props: AppInputProps): React.ReactElement {
  return (
    <Input
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

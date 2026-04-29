"use client";

import React from "react";
import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input";

export type AppTextareaProps = TextAreaProps;

export const AppTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AppTextareaProps
>((props, ref) => {
  return (
    <Input.TextArea
      ref={ref}
      {...props}
      className={[
        "!rounded-[var(--radius-input)] focus:!border-[var(--color-primary)]",
        props.className ?? "",
      ]
        .join(" ")
        .trim()}
    />
  );
});

AppTextarea.displayName = "AppTextarea";

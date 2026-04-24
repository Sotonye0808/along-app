"use client";

import React from "react";
import { Tag } from "antd";
import type { LucideIcon } from "lucide-react";

export interface AppTagProps {
  label: string;
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "muted";
  size?: "xs" | "sm" | "default";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  removable?: boolean;
  onRemove?: () => void;
  pill?: boolean;
  dot?: boolean;
  onClick?: () => void;
  className?: string;
}

const variantClasses: Record<NonNullable<AppTagProps["variant"]>, string> = {
  default:
    "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
  primary:
    "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30",
  success:
    "bg-[var(--color-success)] text-[var(--color-success-text)] border-[var(--color-success-text)]/30",
  warning:
    "bg-[var(--color-warning)]/30 text-[var(--color-warning-text)] border-[var(--color-warning-text)]/30",
  error:
    "bg-[var(--color-error)]/20 text-[var(--color-error-text)] border-[var(--color-error-text)]/30",
  info: "bg-sky-100 text-sky-700 border-sky-300",
  muted: "bg-gray-100 text-gray-500 border-gray-200",
};

const sizeClasses: Record<NonNullable<AppTagProps["size"]>, string> = {
  xs: "text-[10px] px-1.5 py-0.5",
  sm: "text-xs px-2 py-0.5",
  default: "text-sm px-2.5 py-1",
};

export function AppTag({
  label,
  variant = "default",
  size = "default",
  icon: Icon,
  iconPosition = "left",
  removable,
  onRemove,
  pill = true,
  dot,
  onClick,
  className,
}: AppTagProps): React.ReactElement {
  return (
    <Tag
      closable={removable}
      onClose={onRemove}
      onClick={onClick}
      className={[
        "!inline-flex !items-center gap-1 !border",
        variantClasses[variant],
        sizeClasses[size],
        pill ? "!rounded-[var(--radius-pill)]" : "!rounded-md",
        onClick ? "cursor-pointer" : "",
        className ?? "",
      ]
        .join(" ")
        .trim()}>
      {dot ? (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      ) : null}
      {Icon && iconPosition === "left" ? (
        <Icon size={14} aria-hidden="true" />
      ) : null}
      <span>{label}</span>
      {Icon && iconPosition === "right" ? (
        <Icon size={14} aria-hidden="true" />
      ) : null}
    </Tag>
  );
}

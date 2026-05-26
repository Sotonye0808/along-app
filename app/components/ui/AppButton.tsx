"use client";

import React from "react";
import Link from "next/link";
import { Button } from "antd";
import type { ButtonProps } from "antd";
import type { LucideIcon } from "lucide-react";

export interface AppButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "icon";
  size?: "sm" | "default" | "lg";
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  href?: string;
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const sizeMap: Record<
  NonNullable<AppButtonProps["size"]>,
  ButtonProps["size"]
> = {
  sm: "small",
  default: "middle",
  lg: "large",
};

const variantClassMap: Record<
  NonNullable<AppButtonProps["variant"]>,
  string
> = {
  primary:
    "bg-[var(--color-primary)] hover:!bg-[var(--color-primary-light)] !text-white !border-transparent shadow-[0_2px_8px_rgba(0,98,59,0.12)]",
  secondary:
    "bg-transparent !text-[var(--color-primary)] !border-[var(--color-primary)] hover:!bg-[var(--color-primary)]/10 hover:!border-[var(--color-primary-light)]",
  ghost:
    "!bg-transparent !text-[var(--color-text-secondary)] !border-[var(--color-border)] hover:!bg-[var(--color-bg-elevated)] hover:!text-[var(--color-text-primary)]",
  destructive:
    "!bg-[var(--color-error)] hover:brightness-90 !text-white !border-transparent",
  icon: "!rounded-full !p-2 !min-w-0 !h-auto !border-transparent bg-transparent hover:!bg-[var(--color-bg-elevated)]",
};

export function AppButton({
  variant = "primary",
  size = "default",
  loading,
  icon: Icon,
  iconPosition = "left",
  fullWidth,
  disabled,
  onClick,
  type = "button",
  href,
  children,
  className,
  ariaLabel,
}: AppButtonProps): React.ReactElement {
  const iconNode = Icon ? <Icon size={18} aria-hidden="true" /> : null;

  const content = (
    <Button
      htmlType={type}
      type="default"
      size={sizeMap[size]}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "!inline-flex !items-center !justify-center gap-2 !font-semibold !rounded-[var(--radius-button)]",
        fullWidth ? "!w-full" : "",
        variantClassMap[variant],
        className ?? "",
      ]
        .join(" ")
        .trim()}>
      {iconNode && iconPosition === "left" ? iconNode : null}
      {children}
      {iconNode && iconPosition === "right" ? iconNode : null}
    </Button>
  );

  if (variant === "icon" && !ariaLabel) {
    throw new Error(
      "AppButton icon variant requires ariaLabel for accessibility.",
    );
  }

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

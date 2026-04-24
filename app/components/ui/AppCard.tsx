"use client";

import React from "react";
import Link from "next/link";
import { Card } from "antd";

export interface AppCardProps {
  variant?: "default" | "glass" | "elevated" | "flat" | "suggestion";
  padding?: "none" | "sm" | "default" | "lg";
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
  children: React.ReactNode;
  glassIntensity?: "low" | "medium" | "high";
}

const variantClasses: Record<NonNullable<AppCardProps["variant"]>, string> = {
  default: "bg-[var(--color-bg-base)] border border-[var(--color-border)]",
  glass: "glass border border-white/20",
  elevated:
    "bg-[var(--color-bg-base)] border border-[var(--color-border)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
  flat: "bg-[var(--color-bg-elevated)] border border-transparent shadow-none",
  suggestion:
    "bg-[var(--color-primary)]/[0.03] border-l-4 border-l-[var(--color-primary)] border border-[var(--color-border)]",
};

const paddingClasses: Record<NonNullable<AppCardProps["padding"]>, string> = {
  none: "!p-0",
  sm: "!p-3",
  default: "!p-4",
  lg: "!p-6",
};

export function AppCard({
  variant = "default",
  padding = "default",
  hover,
  clickable,
  onClick,
  href,
  className,
  children,
  glassIntensity = "medium",
}: AppCardProps): React.ReactElement {
  const glassClass =
    variant === "glass"
      ? glassIntensity === "low"
        ? "backdrop-blur-sm"
        : glassIntensity === "high"
          ? "backdrop-blur-xl"
          : "backdrop-blur-lg"
      : "";

  const card = (
    <Card
      onClick={onClick}
      className={[
        "!rounded-[var(--radius-card)] transition-all",
        variantClasses[variant],
        paddingClasses[padding],
        glassClass,
        hover
          ? "hover:shadow-[0_8px_32px_rgba(0,98,59,0.15)] hover:-translate-y-0.5"
          : "",
        clickable || href ? "cursor-pointer" : "",
        className ?? "",
      ]
        .join(" ")
        .trim()}>
      {children}
    </Card>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}

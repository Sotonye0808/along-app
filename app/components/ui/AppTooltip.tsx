"use client";

import React from "react";
import { Tooltip } from "antd";
import type { TooltipProps } from "antd";

export interface AppTooltipProps {
  title: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipProps["placement"];
  className?: string;
}

export function AppTooltip({
  title,
  children,
  placement = "top",
  className,
}: AppTooltipProps): React.ReactElement {
  return (
    <Tooltip
      title={title}
      placement={placement}
      mouseEnterDelay={0.15}
      className={className}
      color="var(--color-bg-card-dark)">
      {children}
    </Tooltip>
  );
}

"use client";

import React from "react";
import { Divider } from "antd";

export interface AppDividerProps {
  label?: React.ReactNode;
  orientation?: "left" | "center" | "right";
  className?: string;
}

export function AppDivider({
  label,
  orientation = "left",
  className,
}: AppDividerProps): React.ReactElement {
  return (
    <Divider orientation={orientation} className={className}>
      {label}
    </Divider>
  );
}

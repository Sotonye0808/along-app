"use client";

import React from "react";
import { Alert } from "antd";
import type { AlertProps } from "antd";

export interface AppAlertProps {
  type: NonNullable<AlertProps["type"]>;
  message: React.ReactNode;
  description?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export function AppAlert({
  type,
  message,
  description,
  showIcon = true,
  className,
}: AppAlertProps): React.ReactElement {
  return (
    <Alert
      type={type}
      message={message}
      description={description}
      showIcon={showIcon}
      className={className}
    />
  );
}

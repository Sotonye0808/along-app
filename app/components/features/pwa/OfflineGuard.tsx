"use client";

import React from "react";
import { App, Tooltip } from "antd";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

interface OfflineGuardProps {
  children: React.ReactNode;
  requiresOnline?: boolean;
  message?: string;
  showTooltip?: boolean;
}

/**
 * Component that wraps children and handles offline state
 * Can disable interactions and show feedback when offline
 */
export function OfflineGuard({
  children,
  requiresOnline = false,
  message = "This action requires an internet connection",
  showTooltip = true,
}: OfflineGuardProps) {
  const { isOnline } = useOnlineStatus();
  const { message: antMessage } = App.useApp();

  const handleOfflineClick = (e: React.MouseEvent) => {
    if (!isOnline && requiresOnline) {
      e.preventDefault();
      e.stopPropagation();
      antMessage.warning(message);
    }
  };

  if (!requiresOnline || isOnline) {
    return <>{children}</>;
  }

  // Wrap in tooltip if offline and requires online
  if (showTooltip) {
    return (
      <Tooltip title={message}>
        <div
          onClick={handleOfflineClick}
          className="opacity-50 cursor-not-allowed inline-block">
          {children}
        </div>
      </Tooltip>
    );
  }

  return (
    <div
      onClick={handleOfflineClick}
      className="opacity-50 cursor-not-allowed inline-block">
      {children}
    </div>
  );
}

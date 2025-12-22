"use client";

import React, { useState, useEffect } from "react";
import {
  WifiOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [isVisible, setIsVisible] = useState(true);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    if (wasOffline) {
      setShowOnlineMessage(true);
      const timer = setTimeout(() => {
        setShowOnlineMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline]);

  // Don't show anything if online and not showing reconnect message
  if (isOnline && !showOnlineMessage) {
    return null;
  }

  // Show reconnected message
  if (showOnlineMessage) {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <CheckCircleOutlined className="text-xl" />
          <span className="font-medium">You're back online!</span>
          <button
            onClick={() => setShowOnlineMessage(false)}
            className="ml-2 hover:opacity-70 transition-opacity"
            aria-label="Close message">
            <CloseOutlined />
          </button>
        </div>
      </div>
    );
  }

  // Show offline banner
  if (!isOnline && isVisible) {
    return (
      <div className="fixed top-16 md:top-20 left-0 right-0 z-40 animate-slide-down">
        <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 flex-1">
            <WifiOutlined className="text-xl animate-pulse" />
            <div className="flex-1">
              <p className="font-medium text-sm md:text-base">You're offline</p>
              <p className="text-xs opacity-90 hidden md:block">
                Some features are limited. You can still view cached content.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 hover:opacity-70 transition-opacity p-1"
            aria-label="Hide offline banner">
            <CloseOutlined />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

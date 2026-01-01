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
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    if (wasOffline) {
      setShowOnlineMessage(true);
      const timer = setTimeout(() => {
        setShowOnlineMessage(false);
      }, 3000); // Auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [wasOffline]);

  // Auto-dismiss online message after 3 seconds
  useEffect(() => {
    if (showOnlineMessage) {
      const timer = setTimeout(() => {
        setShowOnlineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showOnlineMessage]);

  // Reset banner visibility when going offline
  useEffect(() => {
    if (!isOnline) {
      setIsBannerVisible(true);
    }
  }, [isOnline]);

  // Show reconnected message (auto-dismisses after 3 seconds)
  if (showOnlineMessage) {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <CheckCircleOutlined className="text-xl" />
          <span className="font-medium text-sm">Back online!</span>
        </div>
      </div>
    );
  }

  // Show offline banner
  if (!isOnline && isBannerVisible) {
    return (
      <div className="fixed top-16 md:top-20 left-0 right-0 z-40 animate-slide-down">
        <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 flex-1">
            <WifiOutlined className="text-xl animate-pulse" />
            <div className="flex-1">
              <p className="font-medium text-sm">You're offline</p>
              <p className="text-xs opacity-90 hidden md:block">
                Some features are limited. You can still view cached content.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBannerVisible(false)}
            className="ml-4 hover:opacity-70 transition-opacity p-1"
            aria-label="Hide offline banner">
            <CloseOutlined />
          </button>
        </div>
      </div>
    );
  }

  // Show persistent small icon when offline and banner is dismissed
  if (!isOnline && !isBannerVisible) {
    return (
      <button
        onClick={() => setIsBannerVisible(true)}
        className="fixed right-4 bottom-20 md:bottom-4 z-40 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110"
        aria-label="Show offline status"
        title="You're offline - Click to show details">
        <WifiOutlined className="text-xl animate-pulse" />
      </button>
    );
  }

  return null;
}

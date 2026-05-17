"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, WifiOff, X } from "lucide-react";
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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline]);

  useEffect(() => {
    if (showOnlineMessage) {
      const timer = setTimeout(() => {
        setShowOnlineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showOnlineMessage]);

  useEffect(() => {
    if (!isOnline) {
      setIsBannerVisible(true);
    }
  }, [isOnline]);

  if (showOnlineMessage) {
    return (
      <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-slide-down">
        <div className="flex items-center gap-3 rounded-lg bg-[var(--color-success)] px-6 py-3 text-[var(--color-success-text)] shadow-lg">
          <CheckCircle2 className="text-xl" aria-hidden="true" />
          <span className="text-sm font-medium">Back online</span>
        </div>
      </div>
    );
  }

  if (!isOnline && isBannerVisible) {
    return (
      <div className="fixed left-0 right-0 top-16 z-40 animate-slide-down md:top-20">
        <div className="flex items-center justify-between bg-[var(--color-warning)] px-4 py-2 text-[var(--color-warning-text)] shadow-md">
          <div className="flex flex-1 items-center gap-3">
            <WifiOff className="text-xl animate-pulse" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">You&apos;re offline</p>
              <p className="hidden text-xs opacity-90 md:block">
                Some features are limited. You can still view cached content.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsBannerVisible(false)}
            className="ml-4 p-1 transition-opacity hover:opacity-70"
            aria-label="Hide offline banner">
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (!isOnline && !isBannerVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsBannerVisible(true)}
        className="fixed bottom-20 right-4 z-40 rounded-full bg-[var(--color-warning)] p-3 text-[var(--color-warning-text)] shadow-lg transition-all hover:scale-110 md:bottom-4"
        aria-label="Show offline status"
        title="You are offline. Click to show details.">
        <WifiOff className="text-xl animate-pulse" aria-hidden="true" />
      </button>
    );
  }

  return null;
}

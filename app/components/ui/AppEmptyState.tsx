"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  Bookmark,
  Calendar,
  FileText,
  MapPin,
  SearchX,
  UserPlus,
  Users,
  WifiOff,
} from "lucide-react";
import { AppButton } from "./AppButton";

export interface EmptyStateConfig {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  size?: "sm" | "default" | "lg";
}

export interface AppEmptyStateProps extends EmptyStateConfig {
  className?: string;
}

export const EMPTY_STATES: Record<string, EmptyStateConfig> = {
  noRoutes: {
    icon: MapPin,
    title: "No routes yet",
    description: "Share the first route for this area.",
  },
  noPosts: {
    icon: FileText,
    title: "No posts yet",
    description: "Be the first to share a route.",
  },
  noResults: {
    icon: SearchX,
    title: "No results",
    description: "Try different keywords or filters.",
  },
  noFollowers: {
    icon: Users,
    title: "No followers yet",
    description: "Share your profile to grow your network.",
  },
  noFollowing: {
    icon: UserPlus,
    title: "Not following anyone",
    description: "Discover routes and follow travelers.",
  },
  noNotifications: {
    icon: Bell,
    title: "All caught up",
    description: "No new notifications.",
  },
  noBookmarks: {
    icon: Bookmark,
    title: "No bookmarks",
    description: "Save routes you want to revisit.",
  },
  offline: {
    icon: WifiOff,
    title: "You're offline",
    description: "Check your connection and try again.",
  },
  error: {
    icon: AlertTriangle,
    title: "Something went wrong",
    description: "Refresh the page or try again later.",
  },
  noEvents: {
    icon: Calendar,
    title: "No events nearby",
    description: "Check back later for events in your area.",
  },
};

export function AppEmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "default",
  className,
}: AppEmptyStateProps): React.ReactElement {
  const iconSize = size === "sm" ? 20 : size === "lg" ? 32 : 24;

  return (
    <div
      className={[
        "w-full flex flex-col items-center justify-center text-center gap-3 py-8",
        className ?? "",
      ]
        .join(" ")
        .trim()}>
      {Icon ? (
        <Icon
          size={iconSize}
          className="text-[var(--color-text-secondary)]"
          aria-hidden="true"
        />
      ) : null}
      <h3 className="font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      {description ? (
        <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
          {description}
        </p>
      ) : null}
      {action ? (
        <AppButton
          variant={action.variant ?? "primary"}
          onClick={action.onClick}>
          {action.label}
        </AppButton>
      ) : null}
    </div>
  );
}

"use client";

import React from "react";
import { formatDate } from "@/lib/utils/format";
import { NOTIFICATION_REGISTRY } from "@/lib/config/notifications";
import { AppTag } from "@/components/ui/AppTag";
import { AppUserLabel } from "@/components/ui/AppUserLabel";

export interface NotificationItemProps {
  notification: AppNotification;
  onClick?: () => void;
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps): React.ReactElement {
  const config = NOTIFICATION_REGISTRY[notification.type];

  return (
    <button
      type="button"
      className={[
        "w-full p-3 text-left transition-colors hover:bg-[var(--color-bg-elevated)]",
        !notification.read ? "bg-[var(--color-primary)]/5" : "",
      ]
        .join(" ")
        .trim()}
      onClick={onClick}>
      <div className="flex items-start gap-3">
        <AppUserLabel
          user={{
            userName: "along",
            firstName: "Along",
            lastName: "Alerts",
            verified: true,
          }}
          avatarSize={32}
          showHandle={false}
          linkToProfile={false}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <AppTag
              label={config.label}
              icon={config.icon}
              size="xs"
              variant="info"
            />
            <span className="text-xs text-[var(--color-text-secondary)]">
              {formatDate(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-primary)]">
            {notification.message}
          </p>
        </div>

        {!notification.read ? (
          <span
            className="mt-2 h-2 w-2 rounded-full bg-[var(--color-primary)]"
            aria-label="Unread notification"
          />
        ) : null}
      </div>
    </button>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { NOTIFICATION_REGISTRY } from "@/lib/config/notifications";
import { AppTag } from "@/components/ui/AppTag";

export interface NotificationItemProps {
  notification: AppNotification;
  onClick?: () => void;
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps): React.ReactElement {
  const config = NOTIFICATION_REGISTRY[notification.type];
  const href = notification.postId ? `/posts/${notification.postId}` : null;
  const Icon = config.icon;

  const inner = (
    <div
      className={[
        "flex items-start gap-3 w-full p-3 text-left transition-colors hover:bg-[var(--color-bg-elevated)]",
        !notification.read ? "bg-[var(--color-primary)]/5" : "",
      ]
        .join(" ")
        .trim()}>
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-elevated)]"
        style={{ color: config.colorToken }}>
        <Icon size={16} aria-hidden="true" />
      </span>

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
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]"
          aria-label="Unread notification"
        />
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block"
        onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="w-full"
      onClick={onClick}>
      {inner}
    </button>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Dropdown } from "antd";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { AppButton } from "@/components/ui/AppButton";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { EMPTY_STATES } from "@/lib/config/emptyStates";
import { NotificationItem } from "./NotificationItem";

interface NotificationsDropdownProps {
  userId: string;
}

export function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications(userId);

  useEffect(() => {
    if (dropdownOpen) {
      void refreshNotifications();
    }
  }, [dropdownOpen, refreshNotifications]);

  const dropdownContent = (
    <div className="w-80 max-h-96 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-base)] shadow-lg">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-base)] p-4">
        <h3 className="font-semibold text-[var(--color-text-primary)]">
          Notifications
        </h3>
        {unreadCount > 0 ? (
          <AppButton
            variant="ghost"
            size="sm"
            onClick={() => void markAllAsRead()}>
            Mark all as read
          </AppButton>
        ) : null}
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center py-8">
            <AppSpinner size={18} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4">
            <AppEmptyState
              title={EMPTY_STATES.noNotifications.title}
              description={EMPTY_STATES.noNotifications.description}
              icon={EMPTY_STATES.noNotifications.icon}
            />
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => {
                if (!notification.read) {
                  void markAsRead(notification.id);
                }
                setDropdownOpen(false);
              }}
            />
          ))
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="border-t border-[var(--color-border)] p-3 text-center">
          <Link
            href="/notifications"
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            onClick={() => setDropdownOpen(false)}>
            See all notifications
          </Link>
        </div>
      ) : null}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={["click"]}
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      placement="bottomRight">
      <Badge count={unreadCount} offset={[-2, 2]}>
        <AppButton variant="icon" icon={Bell} ariaLabel="View notifications" />
      </Badge>
    </Dropdown>
  );
}

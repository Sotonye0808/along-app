"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers/AuthProvider";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS, APP_ROUTES } from "@/lib/constants";
import { ToastService } from "@/lib/services/toastService";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { EMPTY_STATES } from "@/lib/config/emptyStates";
import { NotificationItem } from "@/app/components/features/navigation/NotificationItem";
import { NotificationSettings } from "@/app/components/features/pwa";

export default function NotificationsPage(): React.ReactElement {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const response = await api.get<AppNotification[]>(API_ENDPOINTS.NOTIFICATIONS);
      setNotifications(
        response.data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch {
      ToastService.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      setLoading(false);
      return;
    }
    void fetchNotifications();
  }, [currentUser, isAuthenticated, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch {
      // silent
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch(API_ENDPOINTS.NOTIFICATIONS, { markAll: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      ToastService.success("All notifications marked as read");
    } catch {
      ToastService.error("Failed to update notifications");
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      ToastService.success("Notification deleted");
    } catch {
      ToastService.error("Failed to delete notification");
    }
  }, []);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <AppCard variant="default">
          <AppEmptyState
            title="Sign in to view notifications"
            description="You need to be signed in to access your notifications."
            icon={EMPTY_STATES.noNotifications.icon}
            action={{
              label: "Sign in",
              onClick: () => router.push(APP_ROUTES.LOGIN),
            }}
          />
        </AppCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <AppSpinner size={32} />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Notifications
          </h1>
          {unreadCount > 0 ? (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          ) : null}
        </div>
        {unreadCount > 0 ? (
          <AppButton variant="ghost" size="sm" onClick={() => void markAllAsRead()}>
            Mark all as read
          </AppButton>
        ) : null}
      </div>

      <div className="mb-6">
        <NotificationSettings />
      </div>

      {notifications.length === 0 ? (
        <AppCard variant="default">
          <AppEmptyState
            title={EMPTY_STATES.noNotifications.title}
            description={EMPTY_STATES.noNotifications.description}
            icon={EMPTY_STATES.noNotifications.icon}
          />
        </AppCard>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-base)]">
          {notifications.map((notification, idx) => (
            <div
              key={notification.id}
              className={[
                "group flex items-start",
                idx > 0 ? "border-t border-[var(--color-border)]" : "",
              ]
                .join(" ")
                .trim()}>
              <div className="flex-1">
                <NotificationItem
                  notification={notification}
                  onClick={() => {
                    if (!notification.read) {
                      void markAsRead(notification.id);
                    }
                  }}
                />
              </div>
              <AppButton
                variant="ghost"
                size="sm"
                icon={undefined}
                className="m-2 shrink-0 opacity-0 group-hover:opacity-100"
                ariaLabel="Delete notification"
                onClick={() => void deleteNotification(notification.id)}>
                ×
              </AppButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

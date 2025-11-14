"use client";

import React, { useState, useEffect } from "react";
import { Card, Avatar, Empty, Spin, Button, App } from "antd";
import {
  LikeOutlined,
  CommentOutlined,
  UserAddOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers/AuthProvider";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS, APP_ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";
import { NotificationSettings } from "@/app/components/features/pwa";

export default function NotificationsPage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      return;
    }
    fetchNotifications();
  }, [currentUser, isAuthenticated]);

  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const response = await api.get<AppNotification[]>(
        `${API_ENDPOINTS.NOTIFICATIONS}?userId=${currentUser.id}`
      );
      setNotifications(
        response.data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      message.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`, {
        read: true,
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      const unreadNotifications = notifications.filter((n) => !n.read);

      await Promise.all(
        unreadNotifications.map((n) =>
          api.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${n.id}`, {
            read: true,
          })
        )
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      message.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      message.error("Failed to update notifications");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      message.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      message.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "like":
        return <LikeOutlined className="text-[#00623B]" />;
      case "comment":
        return <CommentOutlined className="text-blue-500" />;
      case "follow":
        return <UserAddOutlined className="text-purple-500" />;
      case "mention":
        return <CommentOutlined className="text-orange-500" />;
      default:
        return null;
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.postId) {
      router.push(`/posts/${notification.postId}`);
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <Empty
            description="Please login to view notifications"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button
            type="primary"
            size="large"
            onClick={() => router.push(APP_ROUTES.LOGIN)}
            className="mt-4 bg-[#00623B]">
            Login
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            type="link"
            onClick={markAllAsRead}
            className="text-[#00623B]">
            Mark all as read
          </Button>
        )}
      </div>

      {/* Push Notification Settings */}
      <div className="mb-6">
        <NotificationSettings />
      </div>

      {notifications.length === 0 ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <Empty
            description="No notifications yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.read
                  ? "bg-blue-50 border-l-4 border-l-[#00623B]"
                  : ""
              }`}
              styles={{ body: { padding: "16px" } }}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                  {getNotificationIcon(notification.type)}
                </div>
                <div
                  className="flex-1 min-w-0"
                  onClick={() => handleNotificationClick(notification)}>
                  <p className="text-gray-800 text-sm md:text-base">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                  danger
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

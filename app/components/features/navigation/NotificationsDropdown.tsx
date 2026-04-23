"use client";

import React, { useState, useEffect } from "react";
import { Badge, Dropdown, Empty, Spin, Button, Avatar } from "antd";
import {
  BellOutlined,
  HeartOutlined,
  CommentOutlined,
  UserAddOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { useNotifications } from "@/lib/hooks/useNotifications";

interface NotificationsDropdownProps {
  userId: string;
}

const getNotificationIcon = (type: AppNotification["type"]) => {
  switch (type) {
    case "like":
      return <HeartOutlined className="text-red-500" />;
    case "comment":
      return <CommentOutlined className="text-blue-500" />;
    case "follow":
      return <UserAddOutlined className="text-[#00623B]" />;
    case "mention":
      return <BellOutlined className="text-orange-500" />;
    default:
      return <BellOutlined />;
  }
};

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
      refreshNotifications();
    }
  }, [dropdownOpen, refreshNotifications]);

  const dropdownContent = (
    <div className="w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Notifications
        </h3>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={markAllAsRead}
            className="text-[#00623B] p-0">
            Mark all as read
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8">
            <Empty
              description="No notifications"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id);
                }
                setDropdownOpen(false);
              }}>
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-[#00623B] rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <Link
            href="/notifications"
            className="text-sm text-[#00623B] hover:text-[#004d2e] font-medium"
            onClick={() => setDropdownOpen(false)}>
            See all notifications
          </Link>
        </div>
      )}
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
        <button
          className="text-2xl text-gray-700 dark:text-gray-300 hover:text-[#00623B] dark:hover:text-[#00a862] transition-colors"
          title="Notifications"
          aria-label="View notifications">
          <BellOutlined />
        </button>
      </Badge>
    </Dropdown>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Switch, Card, Typography, Space, Alert, Button } from "antd";
import { BellOutlined, CheckCircleOutlined } from "@ant-design/icons";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushSubscribed,
  saveSubscriptionToServer,
  removeSubscriptionFromServer,
} from "@/app/lib/utils/push-notifications";

const { Title, Text } = Typography;

// This should be stored in environment variables in production
const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib27SoCOjwTjPR76Z97BExN_qJVJf-DJv-2Xs8sC8zVwW2x9Qp6rSqCG4gI";

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<
    "default" | "granted" | "denied"
  >("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      const currentPermission = getNotificationPermission();
      setPermission(currentPermission);

      if (currentPermission === "granted") {
        const subscribed = await isPushSubscribed();
        setIsSubscribed(subscribed);
      }
    }
  };

  const handleToggleNotifications = async (checked: boolean) => {
    setLoading(true);

    try {
      if (checked) {
        // Request permission if not granted
        if (permission !== "granted") {
          const newPermission = await requestNotificationPermission();
          setPermission(newPermission);

          if (newPermission !== "granted") {
            setLoading(false);
            return;
          }
        }

        // Subscribe to push notifications
        const subscription = await subscribeToPushNotifications(
          VAPID_PUBLIC_KEY
        );

        if (subscription) {
          // Save subscription to server
          const saved = await saveSubscriptionToServer(subscription);
          if (saved) {
            setIsSubscribed(true);
            console.log("Successfully subscribed to notifications");
          }
        }
      } else {
        // Unsubscribe from push notifications
        const unsubscribed = await unsubscribeFromPushNotifications();
        if (unsubscribed) {
          await removeSubscriptionFromServer();
          setIsSubscribed(false);
          console.log("Successfully unsubscribed from notifications");
        }
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <Alert
          message="Notifications Not Supported"
          description="Your browser doesn't support push notifications. Please try using a modern browser like Chrome, Firefox, or Edge."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  if (permission === "denied") {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <Alert
          message="Notifications Blocked"
          description="You've blocked notifications for this site. To enable them, please update your browser settings."
          type="error"
          showIcon
        />
        <div className="mt-4">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            How to enable notifications:
          </Text>
          <ol className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside">
            <li>Click the lock icon in your browser's address bar</li>
            <li>Find the "Notifications" setting</li>
            <li>Change it to "Allow"</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <Space direction="vertical" size="large" className="w-full">
        <div>
          <Title level={4} className="!mb-2 dark:text-gray-200">
            <BellOutlined className="mr-2" />
            Push Notifications
          </Title>
          <Text className="text-gray-600 dark:text-gray-400">
            Stay updated with new posts, comments, and activity
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Text strong className="dark:text-gray-200">
              Enable Notifications
            </Text>
            <br />
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Receive push notifications for important updates
            </Text>
          </div>
          <Switch
            checked={isSubscribed}
            onChange={handleToggleNotifications}
            loading={loading}
          />
        </div>

        {isSubscribed && (
          <Alert
            message="Notifications Enabled"
            description="You'll receive push notifications for new activity"
            type="success"
            icon={<CheckCircleOutlined />}
            showIcon
          />
        )}

        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <Text strong className="dark:text-gray-200">
            You'll be notified about:
          </Text>
          <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• New comments on your posts</li>
            <li>• Likes and reactions</li>
            <li>• New followers</li>
            <li>• Mentions and tags</li>
            <li>• Featured routes and recommendations</li>
          </ul>
        </div>
      </Space>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { AppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import {
  getNotificationPermission,
  isPushNotificationSupported,
  isPushSubscribed,
  removeSubscriptionFromServer,
  requestNotificationPermission,
  saveSubscriptionToServer,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/app/lib/utils/push-notifications";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<
    "default" | "granted" | "denied"
  >("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

    void checkNotificationStatus();
  }, []);

  const handleToggleNotifications = async (nextEnabled: boolean) => {
    if (!VAPID_PUBLIC_KEY) {
      return;
    }

    setLoading(true);
    try {
      if (nextEnabled) {
        if (permission !== "granted") {
          const newPermission = await requestNotificationPermission();
          setPermission(newPermission);
          if (newPermission !== "granted") {
            return;
          }
        }

        const subscription = await subscribeToPushNotifications(VAPID_PUBLIC_KEY);
        if (subscription) {
          const saved = await saveSubscriptionToServer(subscription);
          if (saved) {
            setIsSubscribed(true);
          }
        }
      } else {
        const unsubscribed = await unsubscribeFromPushNotifications();
        if (unsubscribed) {
          await removeSubscriptionFromServer();
          setIsSubscribed(false);
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
      <AppCard>
        <AppAlert
          type="warning"
          message="Notifications not supported"
          description="Your browser does not support push notifications. Try a modern browser like Chrome, Firefox, or Edge."
          showIcon
        />
      </AppCard>
    );
  }

  if (!VAPID_PUBLIC_KEY) {
    return (
      <AppCard>
        <AppAlert
          type="error"
          message="Notifications unavailable"
          description="Push notifications are not configured for this environment."
          showIcon
        />
      </AppCard>
    );
  }

  if (permission === "denied") {
    return (
      <AppCard>
        <AppAlert
          type="error"
          message="Notifications blocked"
          description="You blocked notifications for this site. Update browser permissions and refresh this page."
          showIcon
        />
        <div className="mt-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            How to enable notifications:
          </p>
          <ol className="mt-2 list-inside list-decimal text-sm text-[var(--color-text-secondary)]">
            <li>Click the lock icon in your browser&apos;s address bar</li>
            <li>Find the &quot;Notifications&quot; setting</li>
            <li>Change it to &quot;Allow&quot;</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard>
      <div className="flex w-full flex-col gap-5">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
            <Bell size={18} aria-hidden="true" />
            Push Notifications
          </h3>
          <p className="text-[var(--color-text-secondary)]">
            Stay updated with new posts, comments, and activity.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[var(--color-text-primary)]">
              Notifications
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Receive push notifications for important updates.
            </p>
          </div>
          <AppButton
            variant={isSubscribed ? "secondary" : "primary"}
            icon={isSubscribed ? BellOff : Bell}
            loading={loading}
            onClick={() => {
              void handleToggleNotifications(!isSubscribed);
            }}>
            {isSubscribed ? "Disable" : "Enable"}
          </AppButton>
        </div>

        {isSubscribed ? (
          <AppAlert
            type="success"
            message="Notifications enabled"
            description="You will receive push notifications for new activity."
            showIcon
          />
        ) : null}

        <div className="rounded-lg bg-[var(--color-bg-elevated)] p-4">
          <p className="font-semibold text-[var(--color-text-primary)]">
            You&apos;ll be notified about:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
            <li>• New comments on your posts</li>
            <li>• Likes and reactions</li>
            <li>• New followers</li>
            <li>• Mentions and tags</li>
            <li>• Featured routes and recommendations</li>
          </ul>
        </div>
      </div>
    </AppCard>
  );
}

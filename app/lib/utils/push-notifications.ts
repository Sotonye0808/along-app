/**
 * Push Notification Utilities
 * Handles push notification subscriptions, permissions, and management
 */

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window
    );
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
    if (!isPushNotificationSupported()) return 'denied';
    return Notification.permission as NotificationPermission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!isPushNotificationSupported()) {
        console.warn('Push notifications are not supported');
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        return permission as NotificationPermission;
    } catch (error) {
        console.error('Failed to request notification permission:', error);
        return 'denied';
    }
}

/**
 * Subscribe to push notifications
 * @param vapidPublicKey - The VAPID public key from your server
 */
export async function subscribeToPushNotifications(
    vapidPublicKey: string
): Promise<PushSubscriptionData | null> {
    if (!isPushNotificationSupported()) {
        console.warn('Push notifications are not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // Subscribe to push notifications
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });
        }

        // Convert subscription to JSON
        const subscriptionJSON = subscription.toJSON();

        return {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscriptionJSON.keys?.p256dh || '',
                auth: subscriptionJSON.keys?.auth || '',
            },
        };
    } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
        return null;
    }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!isPushNotificationSupported()) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            const successful = await subscription.unsubscribe();
            console.log('Unsubscribed from push notifications:', successful);
            return successful;
        }

        return true;
    } catch (error) {
        console.error('Failed to unsubscribe from push notifications:', error);
        return false;
    }
}

/**
 * Check if user is currently subscribed to push notifications
 */
export async function isPushSubscribed(): Promise<boolean> {
    if (!isPushNotificationSupported()) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return subscription !== null;
    } catch (error) {
        console.error('Failed to check push subscription:', error);
        return false;
    }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscriptionData | null> {
    if (!isPushNotificationSupported()) return null;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) return null;

        const subscriptionJSON = subscription.toJSON();

        return {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscriptionJSON.keys?.p256dh || '',
                auth: subscriptionJSON.keys?.auth || '',
            },
        };
    } catch (error) {
        console.error('Failed to get push subscription:', error);
        return null;
    }
}

/**
 * Show a local notification (doesn't require push)
 */
export async function showLocalNotification(
    title: string,
    options?: NotificationOptions & { vibrate?: number[] }
): Promise<void> {
    if (!isPushNotificationSupported()) {
        console.warn('Notifications are not supported');
        return;
    }

    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            ...options,
        });
    } catch (error) {
        console.error('Failed to show notification:', error);
    }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

/**
 * Save notification subscription to server
 * This should be called after successfully subscribing
 */
export async function saveSubscriptionToServer(
    subscription: PushSubscriptionData
): Promise<boolean> {
    try {
        const response = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to save subscription to server:', error);
        return false;
    }
}

/**
 * Remove notification subscription from server
 */
export async function removeSubscriptionFromServer(): Promise<boolean> {
    try {
        const response = await fetch('/api/notifications/unsubscribe', {
            method: 'POST',
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to remove subscription from server:', error);
        return false;
    }
}

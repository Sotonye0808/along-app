"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface UseNotificationsReturn {
    notifications: AppNotification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

/**
 * Custom hook for managing notifications across the app
 * Provides centralized notification state and actions
 */
export function useNotifications(userId?: string): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            setNotifications([]);
            return;
        }

        setLoading(true);
        try {
            // Don't pass userId in query - it comes from auth cookie/header
            const response = await api.get<AppNotification[]>(
                `${API_ENDPOINTS.NOTIFICATIONS}?_sort=createdAt&_order=desc&_limit=10`
            );
            setNotifications(response.data || []);
        } catch (error: any) {
            // Handle authentication errors silently
            if (error.response?.status === 401) {
                console.warn("Authentication expired. User needs to log in again.");
                setNotifications([]);
            } else {
                console.error("Failed to fetch notifications:", error);
            }
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const markAsRead = useCallback(async (notificationId: string) => {
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
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const unreadNotifications = notifications.filter((n) => !n.read);
            await Promise.all(
                unreadNotifications.map((n) =>
                    api.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${n.id}`, { read: true })
                )
            );
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    }, [notifications]);

    const refreshNotifications = useCallback(async () => {
        await fetchNotifications();
    }, [fetchNotifications]);

    // Initial fetch
    useEffect(() => {
        if (userId) {
            fetchNotifications();
        }
    }, [userId, fetchNotifications]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!userId) return;

        // DISABLED IN PRODUCTION: Polling causes excessive function calls on Netlify
        // TODO: Replace with WebSocket/SSE for real-time updates in future
        if (process.env.NODE_ENV === 'production') {
            return;
        }

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [userId, fetchNotifications]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
    };
}

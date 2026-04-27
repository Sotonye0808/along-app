"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface UseNotificationsReturn {
    notifications: AppNotification[];
    unreadCount: number;
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    fetchNotifications: () => Promise<void>;
    loadMore: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NOTIFICATIONS_PAGE_SIZE = 20;

/**
 * Custom hook for managing notifications across the app
 * Provides centralized notification state and actions
 */
export function useNotifications(userId?: string): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const fetchPage = useCallback(async (cursor: string | null, append: boolean) => {
        const params = new URLSearchParams();
        params.set('limit', String(NOTIFICATIONS_PAGE_SIZE));
        if (cursor) {
            params.set('cursor', cursor);
        }

        const response = await api.get<AppNotification[]>(
            `${API_ENDPOINTS.NOTIFICATIONS}?${params.toString()}`
        );

        const cursorHeader = response.headers['x-next-cursor'];
        const resolvedNextCursor = typeof cursorHeader === 'string' ? cursorHeader : null;

        setNextCursor(resolvedNextCursor);
        setNotifications((prev) => {
            if (!append) {
                return response.data || [];
            }

            const incoming = response.data || [];
            const knownIds = new Set(prev.map((item) => item.id));
            const merged = [...prev];
            for (const item of incoming) {
                if (!knownIds.has(item.id)) {
                    merged.push(item);
                }
            }
            return merged;
        });
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            setNotifications([]);
            setNextCursor(null);
            return;
        }

        setLoading(true);
        try {
            await fetchPage(null, false);
        } catch (error: unknown) {
            const maybeAxiosError = error as { response?: { status?: number } };
            // Handle authentication errors silently
            if (maybeAxiosError.response?.status === 401) {
                console.warn("Authentication expired. User needs to log in again.");
                setNotifications([]);
                setNextCursor(null);
            } else {
                console.error("Failed to fetch notifications:", error);
            }
        } finally {
            setLoading(false);
        }
    }, [fetchPage, userId]);

    const loadMore = useCallback(async () => {
        if (!userId || !nextCursor || loadingMore) {
            return;
        }

        setLoadingMore(true);
        try {
            await fetchPage(nextCursor, true);
        } catch (error: unknown) {
            console.error("Failed to load more notifications:", error);
        } finally {
            setLoadingMore(false);
        }
    }, [fetchPage, loadingMore, nextCursor, userId]);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await api.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await api.patch(`${API_ENDPOINTS.NOTIFICATIONS}`, {
                markAll: true,
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    }, []);

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
        loadingMore,
        hasMore: Boolean(nextCursor),
        fetchNotifications,
        loadMore,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
    };
}

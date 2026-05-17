import { AlertTriangle, Bell, Bookmark, Calendar, FileText, MapPin, SearchX, UserPlus, Users, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateAction {
    label: string;
    variant?: "primary" | "secondary";
}

export interface EmptyStateConfig {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: EmptyStateAction;
}

export const EMPTY_STATES: Record<string, EmptyStateConfig> = {
    noRoutes: {
        icon: MapPin,
        title: "No routes yet",
        description: "Share the first route for this area.",
    },
    noPosts: {
        icon: FileText,
        title: "No posts yet",
        description: "Be the first to share a route.",
    },
    noResults: {
        icon: SearchX,
        title: "No results",
        description: "Try different keywords or filters.",
    },
    noFollowers: {
        icon: Users,
        title: "No followers yet",
        description: "Share your profile to grow your network.",
    },
    noFollowing: {
        icon: UserPlus,
        title: "Not following anyone",
        description: "Discover routes and follow travelers.",
    },
    noNotifications: {
        icon: Bell,
        title: "All caught up",
        description: "No new notifications.",
    },
    noBookmarks: {
        icon: Bookmark,
        title: "No bookmarks",
        description: "Save routes you want to revisit.",
    },
    offline: {
        icon: WifiOff,
        title: "You're offline",
        description: "Check your connection and try again.",
    },
    error: {
        icon: AlertTriangle,
        title: "Something went wrong",
        description: "Refresh the page or try again later.",
    },
    noEvents: {
        icon: Calendar,
        title: "No events nearby",
        description: "Check back later for events in your area.",
    },
};

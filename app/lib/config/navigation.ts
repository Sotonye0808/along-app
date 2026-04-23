import type { LucideIcon } from "lucide-react";
import {
    Bell,
    Bookmark,
    Compass,
    Home,
    Map,
    Settings,
    Shield,
    ShoppingBag,
    User,
} from "lucide-react";

export type UserRole = "guest" | "user" | "admin";

export interface NavigationItem {
    key: string;
    label: string;
    href: string;
    icon: LucideIcon;
    roles: UserRole[];
    showInSidebar?: boolean;
    showInBottomNav?: boolean;
}

export const NAV_REGISTRY: NavigationItem[] = [
    {
        key: "home",
        label: "Home",
        href: "/home",
        icon: Home,
        roles: ["user", "admin"],
        showInSidebar: true,
        showInBottomNav: true,
    },
    {
        key: "explore",
        label: "Explore",
        href: "/explore",
        icon: Compass,
        roles: ["user", "admin"],
        showInSidebar: true,
        showInBottomNav: true,
    },
    {
        key: "bookmarks",
        label: "Bookmarks",
        href: "/bookmarks",
        icon: Bookmark,
        roles: ["user", "admin"],
        showInSidebar: true,
        showInBottomNav: false,
    },
    {
        key: "notifications",
        label: "Alerts",
        href: "/notifications",
        icon: Bell,
        roles: ["user", "admin"],
        showInSidebar: true,
        showInBottomNav: true,
    },
    {
        key: "marketplace",
        label: "Marketplace",
        href: "/marketplace",
        icon: ShoppingBag,
        roles: ["user", "admin"],
        showInSidebar: true,
        showInBottomNav: false,
    },
    {
        key: "profile",
        label: "Profile",
        href: "/profile",
        icon: User,
        roles: ["user", "admin"],
        showInSidebar: true,
        showInBottomNav: true,
    },
    {
        key: "map",
        label: "Map View",
        href: "/explore",
        icon: Map,
        roles: ["admin"],
        showInSidebar: true,
        showInBottomNav: false,
    },
    {
        key: "trust",
        label: "Trust Network",
        href: "/profile",
        icon: Shield,
        roles: ["admin"],
        showInSidebar: true,
        showInBottomNav: false,
    },
    {
        key: "settings",
        label: "Settings",
        href: "/profile",
        icon: Settings,
        roles: ["user", "admin"],
        showInSidebar: true,
        showInBottomNav: false,
    },
];

export function filterNavItems(
    role: UserRole,
    options?: { sidebarOnly?: boolean; bottomNavOnly?: boolean }
): NavigationItem[] {
    return NAV_REGISTRY.filter((item) => {
        if (!item.roles.includes(role)) {
            return false;
        }

        if (options?.sidebarOnly) {
            return item.showInSidebar === true;
        }

        if (options?.bottomNavOnly) {
            return item.showInBottomNav === true;
        }

        return true;
    });
}

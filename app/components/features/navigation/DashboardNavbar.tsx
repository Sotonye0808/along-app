"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  filterNavItems,
  type NavigationItem,
  type UserRole,
} from "@/lib/config/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useNotifications } from "@/lib/hooks/useNotifications";

interface DashboardNavbarProps {
  userId?: string;
}

function getRoleFromUser(user: User | null): UserRole {
  const role = user?.role;
  if (role === "ADMIN") {
    return "admin";
  }
  return "user";
}

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function renderNavLink(
  item: NavigationItem,
  pathname: string | null,
  unreadCount: number,
  compact = false,
): React.ReactElement {
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;
  const showNotificationDot = item.key === "notifications" && unreadCount > 0;

  return (
    <Link
      key={item.key}
      href={item.href}
      className={[
        "relative inline-flex items-center gap-2 rounded-xl transition-colors",
        compact ? "h-12 w-12 justify-center" : "px-3 py-2",
        active
          ? "bg-[var(--color-primary)] text-white"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]",
      ].join(" ")}
      title={item.label}
      aria-current={active ? "page" : undefined}>
      <Icon size={20} aria-hidden="true" />
      {!compact ? (
        <span className="text-sm font-medium">{item.label}</span>
      ) : null}
      {showNotificationDot ? (
        <span
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-error)]"
          aria-label={`${unreadCount} unread notifications`}
        />
      ) : null}
    </Link>
  );
}

export function DashboardNavbar({ userId }: DashboardNavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const role = getRoleFromUser(isAuthenticated ? user : null);

  const { unreadCount } = useNotifications(userId || "");

  const { primarySidebarItems, adminSidebarItems, bottomItems } =
    useMemo(() => {
      const sidebarItems = filterNavItems(role, { sidebarOnly: true });
      const itemsForBottom = filterNavItems(role, { bottomNavOnly: true });

      return {
        primarySidebarItems: sidebarItems.filter(
          (item) => !(item.roles.length === 1 && item.roles[0] === "admin"),
        ),
        adminSidebarItems: sidebarItems.filter(
          (item) => item.roles.length === 1 && item.roles[0] === "admin",
        ),
        bottomItems: itemsForBottom,
      };
    }, [role]);

  return (
    <>
      <nav className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col items-center border-r border-[var(--color-border)] bg-[var(--color-bg-base)] py-4 md:flex">
        <div className="flex w-full flex-1 flex-col items-center gap-3">
          {primarySidebarItems.map((item) =>
            renderNavLink(item, pathname, unreadCount, true),
          )}
        </div>

        {adminSidebarItems.length > 0 ? (
          <div className="mt-4 w-full border-t border-[var(--color-border)] pt-4">
            <div className="mb-2 px-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Admin
            </div>
            <div className="flex flex-col items-center gap-3">
              {adminSidebarItems.map((item) =>
                renderNavLink(item, pathname, unreadCount, true),
              )}
            </div>
          </div>
        ) : null}
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-2 py-2 md:hidden">
        {bottomItems.map((item) => renderNavLink(item, pathname, unreadCount))}
      </nav>
    </>
  );
}

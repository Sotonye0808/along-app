"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, MapPin, LogIn, Sun, Moon } from "lucide-react";
import {
  filterNavItems,
  type NavigationItem,
  type UserRole,
} from "@/lib/config/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppButton } from "@/components/ui/AppButton";

interface DashboardNavbarProps {
  userId?: string;
}

function getRoleFromUser(user: User | null): UserRole {
  const role = user?.role;
  if (role === "ADMIN") return "admin";
  return "user";
}

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNavbar({ userId }: DashboardNavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const role = getRoleFromUser(isAuthenticated ? user : null);
  const { unreadCount } = useNotifications(userId || "");
  const [collapsed, setCollapsed] = useState(false);

  const { primarySidebarItems, adminSidebarItems, bottomItems } = useMemo(() => {
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

  const sidebarWidth = collapsed ? "w-20" : "w-60";

  return (
    <>
      {/* Desktop Sidebar - Collapsible */}
      <nav
        className={`fixed left-0 top-0 z-40 hidden h-screen ${sidebarWidth} flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-base)] transition-all duration-200 md:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] px-5 py-4">
          <Image
            src="/logo-icon.svg"
            alt="Along"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0"
          />
          {!collapsed && (
            <span className="text-lg font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Along
            </span>
          )}
        </div>

        {/* Primary Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {primarySidebarItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;
              const showBadge = item.key === "notifications" && unreadCount > 0;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                  title={item.label}
                >
                  <Icon size={20} aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                  {showBadge && !collapsed && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-error)] px-1.5 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {showBadge && collapsed && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-error)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Section */}
          {adminSidebarItems.length > 0 && !collapsed && (
            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Admin
              </div>
              <div className="space-y-1">
                {adminSidebarItems.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      <Icon size={20} aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section: Collapse Toggle + Profile */}
        <div className="border-t border-[var(--color-border)] p-3">
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={16}
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
          </button>

          {/* Profile Mini-Card */}
          {isAuthenticated && user ? (
            <Link
              href="/profile"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--color-bg-elevated)] ${collapsed ? "justify-center px-2" : ""}`}
              title={`${user.firstName} ${user.lastName}`}
            >
              <AppAvatar
                user={{
                  userName: user.userName,
                  firstName: user.firstName,
                  avatar: user.avatar,
                  verified: user.verified,
                }}
                size={32}
                linkToProfile={false}
              />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="truncate text-xs text-[var(--color-text-secondary)]">
                    @{user.userName}
                  </div>
                </div>
              )}
            </Link>
          ) : (
            <Link href="/login" className={collapsed ? "flex justify-center" : ""}>
              <AppButton size="sm" icon={LogIn} fullWidth={!collapsed}>
                {collapsed ? "" : "Sign In"}
              </AppButton>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav — icons only, no labels */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-2 py-2 md:hidden">
        {bottomItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          const showBadge = item.key === "notifications" && unreadCount > 0;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              <Icon size={24} aria-hidden="true" />
              {showBadge ? (
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[var(--color-error)]" />
              ) : null}
            </Link>
          );
        })}

        {/* FAB - Share Route */}
        <Link
          href="#"
          className="absolute -top-5 left-1/2 z-50 -translate-x-1/2"
          aria-label="Share a route"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_8px_32px_rgba(0,98,59,0.15)] transition-transform hover:scale-105 active:scale-95">
            <MapPin size={24} />
          </div>
        </Link>
      </nav>
    </>
  );
}
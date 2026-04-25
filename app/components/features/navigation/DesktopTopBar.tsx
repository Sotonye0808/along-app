"use client";

import React from "react";
import Link from "next/link";
import { Moon, Settings, Sun, User, LogOut, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { SearchBar } from "@/components/features/dashboard/SearchBar";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { AppDropdown } from "@/components/ui/AppDropdown";

export function DesktopTopBar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    {
      key: "profile",
      label: "My profile",
      icon: <User size={16} aria-hidden="true" />,
      onClick: () => router.push(APP_ROUTES.PROFILE),
    },
    {
      key: "settings",
      label: "Settings",
      icon: <Settings size={16} aria-hidden="true" />,
      onClick: () => router.push("/settings"),
    },
    {
      key: "theme",
      label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      icon:
        theme === "dark" ? (
          <Sun size={16} aria-hidden="true" />
        ) : (
          <Moon size={16} aria-hidden="true" />
        ),
      onClick: toggleTheme,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogOut size={16} aria-hidden="true" />,
      danger: true,
      onClick: () => {
        void logout();
      },
    },
  ];

  return (
    <header className="fixed left-20 right-0 top-0 z-50 hidden items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-base)] px-6 py-3 md:flex">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          Along
        </h1>
      </div>

      <div className="mx-8 max-w-2xl flex-1">
        <SearchBar />
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <NotificationsDropdown userId={user.id} />
        ) : (
          <AppButton
            variant="icon"
            icon={theme === "dark" ? Sun : Moon}
            ariaLabel="Toggle theme"
            onClick={toggleTheme}
          />
        )}

        {isAuthenticated && user ? (
          <AppDropdown items={menuItems} placement="bottomRight">
            <button
              type="button"
              className="flex items-center gap-3"
              aria-label="Open user menu">
              <AppAvatar
                user={{
                  userName: user.userName,
                  firstName: user.firstName,
                  avatar: user.avatar,
                  verified: user.verified,
                }}
                size={40}
                linkToProfile={false}
              />
              <div className="text-left">
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  @{user.userName}
                </div>
              </div>
            </button>
          </AppDropdown>
        ) : (
          <Link href={APP_ROUTES.LOGIN}>
            <AppButton icon={LogIn}>Login</AppButton>
          </Link>
        )}
      </div>
    </header>
  );
}

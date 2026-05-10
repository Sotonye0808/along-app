"use client";

import React, { useState } from "react";
import { LogIn, LogOut, Moon, Search, Sun, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { SearchBar } from "@/components/features/dashboard/SearchBar";
import Link from "next/link";
import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { AppDropdown } from "@/components/ui/AppDropdown";

export function MobileTopBar() {
  const [searchVisible, setSearchVisible] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <User size={16} aria-hidden="true" />,
      label: "My Profile",
      onClick: () => router.push(APP_ROUTES.PROFILE),
    },
    {
      key: "theme",
      icon:
        theme === "dark" ? (
          <Sun size={16} aria-hidden="true" />
        ) : (
          <Moon size={16} aria-hidden="true" />
        ),
      label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      onClick: toggleTheme,
    },
    {
      key: "logout",
      icon: <LogOut size={16} aria-hidden="true" />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 py-3 transition-colors duration-200 md:hidden">
      {searchVisible ? (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar />
          </div>
          <AppButton
            variant="icon"
            icon={X}
            onClick={() => setSearchVisible(false)}
            ariaLabel="Close search"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--color-primary)]">Along</h1>
          </div>

          <div className="flex items-center gap-4">
            <AppButton
              variant="icon"
              icon={Search}
              onClick={() => setSearchVisible(true)}
              ariaLabel="Search routes and users"
            />

            {isAuthenticated && user ? (
              <NotificationsDropdown userId={user.id} />
            ) : (
              <AppButton
                variant="icon"
                icon={theme === "dark" ? Sun : Moon}
                onClick={toggleTheme}
                ariaLabel={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              />
            )}

            {isAuthenticated && user ? (
              <AppDropdown items={userMenuItems} placement="bottomRight">
                <button type="button" aria-label="Open user menu">
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
                </button>
              </AppDropdown>
            ) : (
              <Link href={APP_ROUTES.LOGIN}>
                <AppButton size="sm" icon={LogIn}>
                  Login
                </AppButton>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

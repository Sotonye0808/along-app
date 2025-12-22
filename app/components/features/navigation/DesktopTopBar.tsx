"use client";

import React from "react";
import { Avatar, Dropdown, Badge, Button, Switch } from "antd";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";
import { useAuth } from "../../../providers/AuthProvider";
import { useTheme } from "../../../providers/ThemeProvider";
import { SearchBar } from "@/components/features/dashboard/SearchBar";
import { NotificationsDropdown } from "./NotificationsDropdown";
import Link from "next/link";

export function DesktopTopBar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => router.push(APP_ROUTES.PROFILE),
    },
    {
      key: "theme",
      icon: theme === "dark" ? <BulbFilled /> : <BulbOutlined />,
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Dark Mode</span>
          <Switch
            checked={theme === "dark"}
            size="small"
            onChange={toggleTheme}
          />
        </div>
      ),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => router.push("/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="hidden md:flex fixed top-0 left-20 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 items-center justify-between z-50 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-[#00623B] dark:text-[#00a862]">
          Along
        </h1>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <SearchBar />
      </div>

      <div className="flex items-center gap-6">
        {isAuthenticated && user ? (
          <NotificationsDropdown userId={user.id} />
        ) : (
          <button
            onClick={toggleTheme}
            className="text-2xl text-gray-700 dark:text-gray-300 hover:text-[#00623B] dark:hover:text-[#00a862] transition-colors"
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-label="Toggle theme">
            {theme === "dark" ? <BulbFilled /> : <BulbOutlined />}
          </button>
        )}

        {isAuthenticated && user ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={["click"]}
            placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar
                size="large"
                src={user.avatar}
                icon={!user.avatar ? <UserOutlined /> : undefined}
                className="bg-[#00623B]">
                {!user.avatar && user.firstName[0]}
                {!user.avatar && user.lastName[0]}
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  @{user.userName}
                </div>
              </div>
            </div>
          </Dropdown>
        ) : (
          <Link href={APP_ROUTES.LOGIN}>
            <Button
              type="primary"
              icon={<LoginOutlined />}
              className="bg-[#00623B]">
              Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

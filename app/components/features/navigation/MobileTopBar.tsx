"use client";

import React, { useState } from "react";
import { Avatar, Dropdown, Badge, Button, Switch } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
  CloseOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { SearchBar } from "@/components/features/dashboard/SearchBar";
import Link from "next/link";

export function MobileTopBar() {
  const [searchVisible, setSearchVisible] = useState(false);
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
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-50 transition-colors duration-200">
      {searchVisible ? (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar />
          </div>
          <button
            type="button"
            onClick={() => setSearchVisible(false)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1">
            <CloseOutlined className="text-lg" />
            <span className="sr-only">Close Button</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#00623B] dark:text-[#00a862]">
              Along
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSearchVisible(true)}
              className="text-xl text-gray-700 dark:text-gray-300 hover:text-[#00623B] dark:hover:text-[#00a862]"
              title="Search"
              aria-label="Search routes and users">
              <SearchOutlined />
            </button>

            {isAuthenticated && user ? (
              <NotificationsDropdown userId={user.id} />
            ) : (
              <button
                onClick={toggleTheme}
                className="text-xl text-gray-700 dark:text-gray-300 hover:text-[#00623B] dark:hover:text-[#00a862]"
                title={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
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
                <Avatar
                  size="default"
                  src={user.avatar}
                  icon={!user.avatar ? <UserOutlined /> : undefined}
                  className="cursor-pointer bg-[#00623B]">
                  {!user.avatar && user.firstName[0]}
                  {!user.avatar && user.lastName[0]}
                </Avatar>
              </Dropdown>
            ) : (
              <Link href={APP_ROUTES.LOGIN}>
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  size="small"
                  className="bg-[#00623B]">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

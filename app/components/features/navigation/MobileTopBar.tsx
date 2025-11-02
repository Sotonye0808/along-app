"use client";

import React, { useState } from "react";
import { Input, Avatar, Dropdown, Badge, Button } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";
import { useAuth } from "@/app/providers/AuthProvider";
import { NotificationsDropdown } from "./NotificationsDropdown";
import Link from "next/link";

export function MobileTopBar() {
  const [searchVisible, setSearchVisible] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

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
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
      {searchVisible ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            placeholder="Search routes, users..."
            prefix={<SearchOutlined className="text-gray-400" />}
            autoFocus
            className="flex-1"
          />
          <button
            onClick={() => setSearchVisible(false)}
            className="text-sm text-gray-600 font-medium">
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#00623B]">Along</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSearchVisible(true)}
              className="text-xl text-gray-700"
              title="Search"
              aria-label="Search routes and users">
              <SearchOutlined />
            </button>

            {isAuthenticated && user ? (
              <NotificationsDropdown userId={user.id} />
            ) : (
              <Badge count={0} size="small" offset={[-2, 2]}>
                <button
                  type="button"
                  className="text-xl text-gray-700"
                  disabled
                  title="Notifications"
                  aria-label="Notifications">
                  <BellOutlined />
                  <span className="sr-only">Bell</span>
                </button>
              </Badge>
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
        </>
      )}
    </div>
  );
}

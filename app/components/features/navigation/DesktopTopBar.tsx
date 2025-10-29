"use client";

import React from "react";
import { Input, Avatar, Dropdown, Badge } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/lib/constants";

export function DesktopTopBar() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(APP_ROUTES.LOGIN);
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
    <div className="hidden md:flex fixed top-0 left-20 right-0 bg-white border-b border-gray-200 px-6 py-3 items-center justify-between z-50">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-[#00623B]">Along</h1>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <Input
          placeholder="Search routes, locations, users..."
          prefix={<SearchOutlined className="text-gray-400" />}
          size="large"
          className="rounded-full"
        />
      </div>

      <div className="flex items-center gap-6">
        <Badge count={5} offset={[-2, 2]}>
          <button className="text-2xl text-gray-700 hover:text-[#00623B] transition-colors">
            <BellOutlined />
          </button>
        </Badge>

        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="bottomRight">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar
              size="large"
              icon={<UserOutlined />}
              className="bg-[#00623B]"
            />
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">
                John Doe
              </div>
              <div className="text-xs text-gray-500">@johndoe</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}

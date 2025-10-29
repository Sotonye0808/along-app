"use client";

import React, { useState } from "react";
import { Input, Avatar, Dropdown, Badge } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/lib/constants";

export function MobileTopBar() {
  const [searchVisible, setSearchVisible] = useState(false);
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
            <MenuOutlined className="text-xl text-gray-700" />
            <h1 className="text-xl font-bold text-[#00623B]">Along</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchVisible(true)}
              className="text-xl text-gray-700">
              <SearchOutlined />
            </button>

            <Badge count={5} size="small" offset={[-2, 2]}>
              <button className="text-xl text-gray-700">
                <BellOutlined />
              </button>
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight">
              <Avatar
                size="default"
                icon={<UserOutlined />}
                className="cursor-pointer bg-[#00623B]"
              />
            </Dropdown>
          </div>
        </>
      )}
    </div>
  );
}

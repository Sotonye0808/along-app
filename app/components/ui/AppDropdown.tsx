"use client";

import React from "react";
import { Dropdown } from "antd";
import type { DropdownProps, MenuProps } from "antd";

export interface AppDropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface AppDropdownProps {
  items: AppDropdownItem[];
  children: React.ReactElement;
  trigger?: DropdownProps["trigger"];
  placement?: DropdownProps["placement"];
}

export function AppDropdown({
  items,
  children,
  trigger = ["click"],
  placement = "bottomRight",
}: AppDropdownProps): React.ReactElement {
  const itemActionMap = new Map(items.map((item) => [item.key, item.onClick]));

  const menuItems: MenuProps["items"] = items.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    danger: item.danger,
    disabled: item.disabled,
  }));

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: ({ key }) => {
          itemActionMap.get(String(key))?.();
        },
      }}
      trigger={trigger}
      placement={placement}>
      {children}
    </Dropdown>
  );
}

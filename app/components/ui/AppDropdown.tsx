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
  const itemActionMap = new Map(
    items.map((item) => [String(item.key), item.onClick]),
  );

  const menuItems = items.map((item) => {
    const labelWithIcon = item.icon ? (
      <>{item.icon}&nbsp;{item.label}</>
    ) : (
      item.label
    );

    return {
      key: item.key,
      label: labelWithIcon,
      danger: item.danger,
      disabled: item.disabled,
      onClick: item.onClick,
    };
  }); // We'll fix the type in a moment

  return (
    <Dropdown
      overlayClassName="app-dropdown"
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

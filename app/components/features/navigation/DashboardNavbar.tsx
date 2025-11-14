"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeOutlined,
  CompassOutlined,
  BellOutlined,
  BookOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge } from "antd";
import { APP_ROUTES } from "@/lib/constants";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  showOnMobile?: boolean;
}

const navItems: NavItem[] = [
  {
    href: APP_ROUTES.DASHBOARD,
    icon: <HomeOutlined />,
    label: "Feed",
    showOnMobile: true,
  },
  {
    href: APP_ROUTES.EXPLORE,
    icon: <CompassOutlined />,
    label: "Explore",
    showOnMobile: true,
  },
  {
    href: "/notifications",
    icon: <BellOutlined />,
    label: "Notifications",
    badge: 3,
    showOnMobile: false,
  },
  {
    href: APP_ROUTES.BOOKMARKS,
    icon: <BookOutlined />,
    label: "Bookmarks",
    showOnMobile: true,
  },
  {
    href: APP_ROUTES.MARKETPLACE,
    icon: <ShoppingOutlined />,
    label: "Marketplace",
    showOnMobile: true,
  },
];

export function DashboardNavbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === APP_ROUTES.DASHBOARD) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-20 md:bg-white md:border-r md:border-gray-200 md:py-4 md:items-center md:gap-6 z-40">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${
                active
                  ? "bg-[#00623B] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title={item.label}>
              <Badge count={item.badge} size="small" offset={[10, -5]}>
                <span className="text-2xl">{item.icon}</span>
              </Badge>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center z-40">
        {navItems
          .filter((item) => item.showOnMobile)
          .map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-all ${
                  active ? "text-[#00623B]" : "text-gray-600"
                }`}>
                <Badge count={item.badge} size="small" offset={[5, 0]}>
                  <span className="text-2xl">{item.icon}</span>
                </Badge>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
      </nav>
    </>
  );
}

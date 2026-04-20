"use client";

import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { APP_ROUTES } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with back and guest options */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between z-50">
        <Link href="/">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="text-gray-700 dark:text-gray-300">
            Back
          </Button>
        </Link>
        <Link href={APP_ROUTES.DASHBOARD}>
          <Button type="link" className="text-[#00623B] dark:text-[#00a862]">
            Continue as Guest
          </Button>
        </Link>
      </div>
      {/* Add padding to account for fixed header */}
      <main className="pt-16">{children}</main>
    </div>
  );
}

"use client";

import { DashboardNavbar } from "@/components/features/navigation/DashboardNavbar";
import { MobileTopBar } from "@/components/features/navigation/MobileTopBar";
import { DesktopTopBar } from "@/components/features/navigation/DesktopTopBar";
import { useAuth } from "@/app/providers/AuthProvider";
import { Spin } from "antd";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <DashboardNavbar />
      <MobileTopBar />
      <DesktopTopBar />

      {/* Main Content */}
      <main className="md:ml-20 md:mt-12 mt-8 mb-20 md:mb-0">
        <div className="max-w-7xl mx-auto p-1 md:p-4">{children}</div>
      </main>
    </div>
  );
}

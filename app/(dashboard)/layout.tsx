"use client";

import { DashboardNavbar } from "@/components/features/navigation/DashboardNavbar";
import { MobileTopBar } from "@/components/features/navigation/MobileTopBar";
import { DesktopTopBar } from "@/components/features/navigation/DesktopTopBar";
import { ScrollToTop } from "@/components/features/navigation/ScrollToTop";
import { OfflineIndicator } from "@/components/features/pwa";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/app/providers/AuthProvider";
import { Spin } from "antd";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Navigation */}
        <DashboardNavbar userId={user?.id} />
        <MobileTopBar />
        <DesktopTopBar />

        {/* Main Content */}
        <main className="md:ml-20 md:mt-12 mt-8 mb-20 md:mb-0">
          <div className="max-w-7xl mx-auto p-1 md:p-4">{children}</div>
        </main>

        {/* Scroll to Top Button */}
        <ScrollToTop />
      </div>
    </ErrorBoundary>
  );
}

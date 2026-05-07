"use client";

import { DashboardNavbar } from "@/components/features/navigation/DashboardNavbar";
import { MobileTopBar } from "@/components/features/navigation/MobileTopBar";
import { DesktopTopBar } from "@/components/features/navigation/DesktopTopBar";
import { ScrollToTop } from "@/components/features/navigation/ScrollToTop";
import { OfflineIndicator } from "@/components/features/pwa";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppFooter } from "@/components/ui/AppFooter";
import { useAuth } from "@/app/providers/AuthProvider";
import { AppPageLoader } from "@/components/ui/AppPageLoader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();

  if (loading) {
    return <AppPageLoader />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] transition-colors duration-200">
        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Navigation */}
        <DashboardNavbar userId={user?.id} />
        <MobileTopBar />
        <DesktopTopBar />

        {/* Main Content */}
        <main className="mb-20 mt-8 md:mb-0 md:ml-20 md:mt-12">
          <div className="max-w-7xl mx-auto p-1 md:p-4">{children}</div>
        </main>

        {/* Footer */}
        <div className="md:ml-20">
          <AppFooter />
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTop />
      </div>
    </ErrorBoundary>
  );
}

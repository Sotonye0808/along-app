"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardNavbar } from "@/components/features/navigation/DashboardNavbar";
import { MobileTopBar } from "@/components/features/navigation/MobileTopBar";
import { DesktopTopBar } from "@/components/features/navigation/DesktopTopBar";
import { APP_ROUTES } from "@/lib/constants";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication by making a request to verify the token
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace(APP_ROUTES.LOGIN);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        router.replace(APP_ROUTES.LOGIN);
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <DashboardNavbar />
      <MobileTopBar />
      <DesktopTopBar />

      {/* Main Content */}
      <main className="md:ml-20 md:mt-16 mt-16 mb-20 md:mb-0">
        <div className="max-w-7xl mx-auto p-4">{children}</div>
      </main>
    </div>
  );
}

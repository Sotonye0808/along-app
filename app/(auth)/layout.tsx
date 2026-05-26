"use client";

import { ArrowLeft, LogIn, Sun, Moon } from "lucide-react";
import { APP_ROUTES } from "@/lib/constants";
import { AppButton } from "@/components/ui/AppButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Header with back and guest options */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 py-3">
        <div className="flex items-center gap-2">
          <AppButton href="/" variant="ghost" icon={ArrowLeft} ariaLabel="Back">
            Back
          </AppButton>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AppButton href={APP_ROUTES.DASHBOARD} variant="ghost" icon={LogIn}>
            Continue as Guest
          </AppButton>
        </div>
      </div>
      {/* Add padding to account for fixed header */}
      <main className="pt-16">{children}</main>
    </div>
  );
}

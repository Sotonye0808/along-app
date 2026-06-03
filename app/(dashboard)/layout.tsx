"use client"

import { useRequireAuth } from "@/app/hooks/useRequireAuth"
import { AppPageLoader, AppFooter } from "@/app/components/ui"
import GuestBanner from "@/app/components/ui/GuestBanner"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isGuest } = useRequireAuth("")

  if (isLoading) {
    return <AppPageLoader />
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {isGuest && <GuestBanner />}
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  )
}

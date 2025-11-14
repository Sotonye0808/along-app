"use client";

import {
  Feed,
  SuggestionsPanel,
  ShareRouteButton,
} from "@/components/features/dashboard";

export default function DashboardPage() {
  return (
    <div className="w-full mx-auto px-1 py-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed Column */}
        <div className="order-2 lg:order-1 lg:col-span-7 xl:col-span-8">
          <Feed />
        </div>

        {/* Sidebar Column */}
        <div className="order-1 lg:order-2 lg:block lg:col-span-5 xl:col-span-4">
          <div className="sticky top-20 space-y-6">
          <div className="mb-4 hidden md:block">
            <ShareRouteButton />
          </div>
            <SuggestionsPanel />
          </div>
        </div>
      </div>

      {/* Mobile Share Button (Floating) */}
      <div className="md:hidden">
        <ShareRouteButton />
      </div>
    </div>
  );
}

"use client";

import {
  Feed,
  SuggestionsPanel,
  ShareRouteButton,
} from "@/components/features/dashboard";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="mb-4 hidden md:block">
            <ShareRouteButton />
          </div>
          <Feed />
        </div>

        {/* Sidebar Column */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <div className="sticky top-6 space-y-6">
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

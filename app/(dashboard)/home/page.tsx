"use client";

import {
  Feed,
  SuggestionsPanel,
  ShareRouteButton,
} from "@/components/features/dashboard";

export default function DashboardPage() {
  return (
    <div className="w-full mx-auto px-1 py-3 max-w-[1200px]">
      <div className="flex gap-6">
        {/* Sidebar Column - 240px */}
        <aside className="hidden lg:block w-[240px] shrink-0">
          <div className="sticky top-20 space-y-6">
            <div className="mb-4">
              <ShareRouteButton />
            </div>
            <SuggestionsPanel />
          </div>
        </aside>

        {/* Main Feed Column - 680px */}
        <main className="flex-1 min-w-0 max-w-[680px]">
          <Feed />
        </main>

        {/* Suggestions Column - 280px */}
        <aside className="hidden xl:block w-[280px] shrink-0">
          <div className="sticky top-20 space-y-6">
            <SuggestionsPanel />
          </div>
        </aside>
      </div>

      {/* Mobile Share Button (Floating) */}
      <div className="lg:hidden">
        <ShareRouteButton />
      </div>
    </div>
  );
}

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

        {/* Right Column - 280px (info sidebar, not duplicate suggestions) */}
        <aside className="hidden xl:block w-[280px] shrink-0">
          <div className="sticky top-20 space-y-6">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-base)] p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                About Along
              </h3>
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                Share verified routes, discover trusted paths, and navigate
                your city with confidence. Join a community of travelers
                sharing real-time commute tips every day.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["#transit", "#commute", "#travel", "#routes", "#maps"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] rounded-full bg-[var(--color-bg-elevated)] px-2.5 py-1 text-[var(--color-text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
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

"use client";

import Link from "next/link";
import { Compass, House, MapPinned } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,98,59,0.12),_transparent_55%),linear-gradient(180deg,#f7faf4_0%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center">
        <AppCard variant="glass" padding="lg" className="w-full">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-[var(--color-primary)]/10 p-4 text-[var(--color-primary)]">
              <MapPinned size={36} aria-hidden="true" />
            </div>
          </div>

          <AppEmptyState
            title="We couldn't find that route"
            description="The page may have moved, been removed, or never existed. Try heading back to the feed or explore routes nearby."
            icon={Compass}
            size="lg"
          />

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/home">
              <AppButton icon={House}>Back home</AppButton>
            </Link>
            <Link href="/explore">
              <AppButton variant="secondary" icon={Compass}>
                Explore routes
              </AppButton>
            </Link>
          </div>
        </AppCard>
      </div>
    </div>
  );
}

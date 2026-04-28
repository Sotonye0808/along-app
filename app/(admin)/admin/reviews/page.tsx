"use client";

import React from "react";
import { Star } from "lucide-react";
import { AppCard } from "@/components/ui/AppCard";

export default function AdminReviewsPage(): React.ReactElement {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Reviews</h1>
      <AppCard variant="default">
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Star
            size={36}
            className="text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-[var(--color-text-secondary)]">
            Route review moderation — coming soon.
          </p>
        </div>
      </AppCard>
    </div>
  );
}

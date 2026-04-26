"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,98,59,0.12),_transparent_55%),linear-gradient(180deg,#f7faf4_0%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center">
        <AppCard variant="glass" padding="lg" className="w-full">
          <AppEmptyState
            icon={AlertTriangle}
            title="Something went wrong"
            description={
              error.message ||
              "An unexpected error occurred. Try again or return home."
            }
            size="lg"
          />

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <AppButton icon={RotateCcw} onClick={reset}>
              Try again
            </AppButton>
            <Link href="/home">
              <AppButton variant="secondary">Back home</AppButton>
            </Link>
          </div>
        </AppCard>
      </div>
    </div>
  );
}

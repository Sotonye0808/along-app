"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,98,59,0.12),_transparent_55%),linear-gradient(180deg,#f7faf4_0%,#ffffff_100%)] px-4 py-10">
          <div className="mx-auto flex min-h-screen max-w-3xl items-center">
            <AppCard variant="glass" padding="lg" className="w-full">
              <AppEmptyState
                icon={AlertTriangle}
                title="Application error"
                description={
                  error.message ||
                  "The app hit an unrecoverable error. Reset to reload the current session."
                }
                size="lg"
              />

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <AppButton icon={RotateCcw} onClick={reset}>
                  Reload app
                </AppButton>
                <Link href="/home">
                  <AppButton variant="secondary">Back home</AppButton>
                </Link>
              </div>
            </AppCard>
          </div>
        </div>
      </body>
    </html>
  );
}

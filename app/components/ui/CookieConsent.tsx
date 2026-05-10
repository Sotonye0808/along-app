"use client";

import React from "react";
import Link from "next/link";
import { useCookieConsent } from "@/app/providers/CookieConsentProvider";
import { AppButton } from "./AppButton";

export function CookieConsent(): React.ReactElement {
  const { accepted, accept } = useCookieConsent();

  if (accepted) {
    return <></>;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[min(95vw,720px)] -translate-x-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-base)] p-4 shadow-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[var(--color-text-secondary)]">
          We use cookies to improve route recommendations and platform
          performance. Read our{" "}
          <Link
            href="/privacy"
            className="text-[var(--color-primary)] underline">
            privacy policy
          </Link>
          .
        </p>
        <AppButton
          onClick={() => {
            accept();
          }}>
          Accept
        </AppButton>
      </div>
    </div>
  );
}

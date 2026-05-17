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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 py-3 shadow-xl">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Along uses necessary cookies to keep you signed in and improve your
          experience. By using Along, you accept this. Find out more in our{" "}
          <Link
            href="/privacy"
            className="text-[var(--color-primary)] underline">
            Privacy Policy -&gt;
          </Link>
        </p>
        <AppButton
          variant="primary"
          onClick={() => {
            accept();
          }}>
          Got it
        </AppButton>
      </div>
    </div>
  );
}

"use client";

import { CookieConsent } from "@/app/components/ui";

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieConsent />
    </>
  );
}

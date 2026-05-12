"use client";

import React from "react";

const KEY = "along_cookie_consent";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readConsentCookie(): boolean {
  if (typeof document === "undefined") return false;
  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${KEY}=`));
  return cookie?.split("=")[1] === "accepted";
}

function writeConsentCookie(): void {
  if (typeof document === "undefined") return;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${KEY}=accepted; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

interface CookieConsentContextValue {
  accepted: boolean;
  accept: () => void;
}

const CookieConsentContext = React.createContext<CookieConsentContextValue>({
  accepted: false,
  accept: () => undefined,
});

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [accepted, setAccepted] = React.useState(false);

  React.useEffect(() => {
    setAccepted(readConsentCookie());
  }, []);

  const accept = React.useCallback(() => {
    setAccepted(true);
    writeConsentCookie();
  }, []);

  return (
    <CookieConsentContext.Provider value={{ accepted, accept }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  return React.useContext(CookieConsentContext);
}

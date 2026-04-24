"use client";

import React from "react";

const KEY = "along_cookie_consent";

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
    if (typeof window !== "undefined") {
      setAccepted(window.localStorage.getItem(KEY) === "accepted");
    }
  }, []);

  const accept = React.useCallback(() => {
    setAccepted(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, "accepted");
    }
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

"use client";

import React from "react";
import type { ToastPayload } from "@/lib/services/toastService";
import { ToastService } from "@/lib/services/toastService";

interface GlobalToastContextValue {
  currentToast: ToastPayload | null;
  clearToast: () => void;
}

const GlobalToastContext = React.createContext<GlobalToastContextValue>({
  currentToast: null,
  clearToast: () => undefined,
});

export function GlobalToastProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [currentToast, setCurrentToast] = React.useState<ToastPayload | null>(
    null,
  );

  React.useEffect(() => {
    ToastService.registerListener((payload) => {
      setCurrentToast(payload);
      if (payload.durationMs) {
        window.setTimeout(() => {
          setCurrentToast((prev) => (prev === payload ? null : prev));
        }, payload.durationMs);
      }
    });

    return () => {
      ToastService.unregisterListener();
    };
  }, []);

  const clearToast = React.useCallback(() => setCurrentToast(null), []);

  return (
    <GlobalToastContext.Provider value={{ currentToast, clearToast }}>
      {children}
    </GlobalToastContext.Provider>
  );
}

export function useGlobalToast(): GlobalToastContextValue {
  return React.useContext(GlobalToastContext);
}

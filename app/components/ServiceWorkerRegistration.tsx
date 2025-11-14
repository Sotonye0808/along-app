"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/app/lib/utils/sw-register";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker on mount
    if (process.env.NODE_ENV === "production") {
      registerServiceWorker()
        .then(({ success, registration }) => {
          if (success) {
            console.log("Service Worker registered:", registration);
          }
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null; // This component doesn't render anything
}

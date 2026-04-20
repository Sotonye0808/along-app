"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/app/lib/utils/sw-register";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register service worker in production or when explicitly enabled
    const isProduction = process.env.NODE_ENV === "production";
    const enableInDev = process.env.NEXT_PUBLIC_ENABLE_SW_IN_DEV === "true";

    if (!isProduction && !enableInDev) {
      console.log(
        "[SW] Service Worker registration skipped in development. Set NEXT_PUBLIC_ENABLE_SW_IN_DEV=true to enable."
      );
      return;
    }

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Wait for page load to avoid interfering with initial render
      window.addEventListener("load", () => {
        registerServiceWorker()
          .then(({ success, registration }) => {
            if (success) {
              console.log("[SW] Service Worker registered:", registration);
            }
          })
          .catch((error) => {
            console.error("[SW] Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return null; // This component doesn't render anything
}

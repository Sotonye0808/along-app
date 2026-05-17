"use client";

import { useEffect, useState } from "react";
import { X, Download, CheckCircle2 } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppModal } from "@/components/ui/AppModal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [canPromptAgain, setCanPromptAgain] = useState(false);
  const promptSeenKey = "along_install_prompt_seen";
  const dismissKey = "along_install_prompt_dismissed";

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(
        (window.navigator as Navigator & { standalone?: boolean }).standalone,
      )
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed
    const sessionGate = sessionStorage.getItem(promptSeenKey) === "true";
    if (sessionGate) {
      return;
    }

    const dismissed = localStorage.getItem(dismissKey);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissal =
        (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show prompt again after 7 days
      if (daysSinceDismissal < 7) {
        return;
      }
    }

    setCanPromptAgain(true);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setIsReady(true);
      sessionStorage.setItem(promptSeenKey, "true");
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log("App was installed");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
      // Save dismissal timestamp
      localStorage.setItem(dismissKey, Date.now().toString());
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
    setIsReady(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(dismissKey, Date.now().toString());
    sessionStorage.setItem(promptSeenKey, "true");
  };

  // Don't show if already installed or no prompt available
  if (
    isInstalled ||
    !canPromptAgain ||
    !showPrompt ||
    !deferredPrompt ||
    !isReady
  ) {
    return null;
  }

  return (
    <AppModal
      open={showPrompt}
      onClose={handleDismiss}
      title="Install Along"
      subtitle="Add Along to your device for faster access and offline support."
      icon={Download}
      footer={null}
      className="install-prompt-modal">
      <div className="space-y-4 py-1 text-[var(--color-text-primary)]">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-[var(--color-primary)]" size={18} />
            <div>
              <p className="font-medium">Works offline</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Access your routes even without internet.
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <CheckCircle2 className="text-[var(--color-primary)]" size={18} />
            <div>
              <p className="font-medium">Fast and reliable</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Launch directly from your home screen.
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <CheckCircle2 className="text-[var(--color-primary)]" size={18} />
            <div>
              <p className="font-medium">Stay updated</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Receive push notifications for important updates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton variant="ghost" icon={X} onClick={handleDismiss}>
            Maybe later
          </AppButton>
          <AppButton icon={Download} onClick={handleInstallClick}>
            Install now
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}

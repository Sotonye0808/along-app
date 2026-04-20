"use client";

import { useState, useEffect } from "react";
import { Button, Modal } from "antd";
import { DownloadOutlined, CloseOutlined } from "@ant-design/icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem("install-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissal =
        (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show prompt again after 7 days
      if (daysSinceDismissal < 7) {
        return;
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);

      // Show prompt after a short delay (better UX)
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
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
        handleBeforeInstallPrompt
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
      localStorage.setItem("install-prompt-dismissed", Date.now().toString());
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("install-prompt-dismissed", Date.now().toString());
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Modal
      open={showPrompt}
      onCancel={handleDismiss}
      footer={null}
      closeIcon={<CloseOutlined />}
      centered
      className="install-prompt-modal">
      <div className="text-center py-4">
        <div className="text-6xl mb-4">📱</div>
        <h2 className="text-2xl font-bold mb-2 dark:text-gray-200">
          Install Along App
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Install Along on your device for a better experience. Get quick
          access, offline support, and push notifications.
        </p>

        <div className="space-y-3 mb-6 text-left max-w-sm mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-xl">✓</span>
            <div className="flex-1">
              <p className="font-medium dark:text-gray-200">Works Offline</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access your routes even without internet
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-xl">✓</span>
            <div className="flex-1">
              <p className="font-medium dark:text-gray-200">Fast & Reliable</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Instant loading from your home screen
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-xl">✓</span>
            <div className="flex-1">
              <p className="font-medium dark:text-gray-200">Stay Updated</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get push notifications for new content
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={handleDismiss} size="large">
            Maybe Later
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleInstallClick}
            size="large">
            Install Now
          </Button>
        </div>
      </div>
    </Modal>
  );
}

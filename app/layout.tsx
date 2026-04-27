import type { Metadata } from "next";
import { AntdProvider } from "./providers/AntdProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { CookieConsentProvider } from "./providers/CookieConsentProvider";
import { GlobalModalProvider } from "./providers/GlobalModalProvider";
import { GlobalToastProvider } from "./providers/GlobalToastProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";
import { InstallPrompt } from "./components/features/pwa";
import { CookieConsent } from "./components/ui/CookieConsent";
import { GlobalConfirmModal } from "./components/ui/GlobalConfirmModal";
import { GlobalUndoToast } from "./components/ui/GlobalUndoToast";
import { DEFAULT_OG_IMAGE, getSiteUrl } from "./lib/utils/metadata";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Along - Share Your Travel Routes",
    template: "%s | Along",
  },
  description:
    "Discover and share amazing travel routes with the Along community. Connect with fellow travelers, bookmark routes, and plan your next adventure.",
  keywords: [
    "travel",
    "routes",
    "social",
    "community",
    "destinations",
    "adventure",
    "Along",
    "travel planning",
  ],
  authors: [{ name: "Along Team" }],
  creator: "Along",
  publisher: "Along",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Along - Share Your Travel Routes",
    description:
      "Discover and share amazing travel routes with the Along community. Connect with fellow travelers, bookmark routes, and plan your next adventure.",
    siteName: "Along",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Along - Share Your Travel Routes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Along - Share Your Travel Routes",
    description:
      "Discover and share amazing travel routes with the Along community. Connect with fellow travelers, bookmark routes, and plan your next adventure.",
    images: ["/assets/images/og-image.png"],
    creator: "@along_app",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Along",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00623B" />
        <link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-sans antialiased">
        <ServiceWorkerRegistration />
        <ThemeProvider>
          <CookieConsentProvider>
            <GlobalToastProvider>
              <GlobalModalProvider>
                <AntdProvider>
                  <AuthProvider>
                    {children}
                    <InstallPrompt />
                    <CookieConsent />
                    <GlobalConfirmModal />
                    <GlobalUndoToast />
                  </AuthProvider>
                </AntdProvider>
              </GlobalModalProvider>
            </GlobalToastProvider>
          </CookieConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

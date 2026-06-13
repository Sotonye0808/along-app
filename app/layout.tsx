import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { GlobalModalProvider } from "@/app/providers/GlobalModalProvider";
import { GlobalToastProvider } from "@/app/providers/GlobalToastProvider";
import { CookieConsentProvider } from "@/app/providers/CookieConsentProvider";
import { OnlineStatusProvider } from "@/app/providers/OnlineStatusProvider";
import { PushProvider } from "@/app/providers/PushProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { I18nProvider } from "@/app/providers/I18nProvider";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import BackToTop from "@/app/components/ui/BackToTop";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://along.app"),
  title: "Along — Navigate Together",
  description:
    "Along is a social travel-intelligence platform for sharing, verifying, and discovering transport routes in West Africa.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Along — Navigate Together",
    description: "Along is a social travel-intelligence platform for sharing, verifying, and discovering transport routes in West Africa.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://along.app",
    siteName: "Along",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Along — Navigate Together",
    description: "Along is a social travel-intelligence platform for sharing, verifying, and discovering transport routes in West Africa.",
    images: ["/og-image.png"],
  },
  other: {
    "google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <Script id="resource-hints" strategy="afterInteractive">
          {`
            const hints = [
              { rel: "preconnect", href: "https://fonts.googleapis.com" },
              { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
              { rel: "preconnect", href: "https://api.mapbox.com" },
              { rel: "dns-prefetch", href: "https://api.mapbox.com" },
            ];
            hints.forEach(h => {
              const link = document.createElement("link");
              link.rel = h.rel;
              link.href = h.href;
              if (h.crossOrigin) link.crossOrigin = h.crossOrigin;
              document.head.appendChild(link);
            });
          `}
        </Script>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <OnlineStatusProvider>
                <PushProvider>
                  <GlobalModalProvider>
                    <GlobalToastProvider>
                      <CookieConsentProvider>
                        {children}
                        <ThemeToggle />
                        <BackToTop />
                      </CookieConsentProvider>
                    </GlobalToastProvider>
                  </GlobalModalProvider>
                </PushProvider>
              </OnlineStatusProvider>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

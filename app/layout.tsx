import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { GlobalModalProvider } from "@/app/providers/GlobalModalProvider";
import { GlobalToastProvider } from "@/app/providers/GlobalToastProvider";
import { CookieConsentProvider } from "@/app/providers/CookieConsentProvider";
import { OnlineStatusProvider } from "@/app/providers/OnlineStatusProvider";
import { PushProvider } from "@/app/providers/PushProvider";

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
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <OnlineStatusProvider>
            <PushProvider>
              <GlobalModalProvider>
                <GlobalToastProvider>
                  <CookieConsentProvider>{children}</CookieConsentProvider>
                </GlobalToastProvider>
              </GlobalModalProvider>
            </PushProvider>
          </OnlineStatusProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

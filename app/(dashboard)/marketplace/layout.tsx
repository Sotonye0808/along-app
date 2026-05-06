import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Marketplace | Along",
  description:
    "Browse transport providers, rideshares, and mobility partners on Along Marketplace.",
  keywords: ["marketplace", "transport", "rideshare", "danfo", "BRT", "Nigeria", "Along"],
  openGraph: {
    title: "Marketplace | Along",
    description: "Discover transport providers and mobility partners.",
    type: "website",
    url: "/marketplace",
  },
  twitter: {
    card: "summary",
    title: "Marketplace | Along",
    description: "Discover transport providers and mobility partners.",
  },
};

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

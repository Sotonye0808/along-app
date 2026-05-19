import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Marketplace | Along",
  description:
    "Discover Along's upcoming marketplace integration powered by Transact for e-commerce workflows.",
  keywords: ["marketplace", "transact", "e-commerce", "commerce", "integration", "Along"],
  openGraph: {
    title: "Marketplace | Along",
    description: "Discover Along's upcoming marketplace and Transact integration.",
    type: "website",
    url: "/marketplace",
  },
  twitter: {
    card: "summary",
    title: "Marketplace | Along",
    description: "Discover Along's upcoming marketplace and Transact integration.",
  },
};

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

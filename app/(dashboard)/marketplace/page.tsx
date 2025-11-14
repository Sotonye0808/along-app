import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse and discover travel-related services, products, and experiences shared by the Along community.",
  keywords: [
    "marketplace",
    "travel services",
    "travel products",
    "Along",
    "buy",
    "sell",
  ],
  openGraph: {
    title: "Marketplace | Along",
    description:
      "Browse and discover travel-related services, products, and experiences shared by the Along community.",
    type: "website",
    url: "/marketplace",
  },
  twitter: {
    card: "summary",
    title: "Marketplace | Along",
    description:
      "Browse and discover travel-related services, products, and experiences shared by the Along community.",
  },
};

export default function MarketplacePage() {
  return (
    <div>
      <h1>Marketplace</h1>
      {/* Marketplace content will be implemented here */}
    </div>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Explore | Along",
  description: "Explore transport routes near you",
  keywords: [
    "explore",
    "discover",
    "transport routes",
    "along",
    "Lagos",
    "Nigeria",
    "commute",
  ],
  openGraph: {
    title: "Explore | Along",
    description: "Explore transport routes near you",
    type: "website",
    url: "/explore",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore | Along",
    description: "Explore transport routes near you",
  },
};

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

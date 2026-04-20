import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Explore trending travel routes, discover new destinations, and find inspiration for your next adventure on Along.",
  keywords: [
    "explore",
    "discover",
    "travel routes",
    "destinations",
    "trending",
    "Along",
  ],
  openGraph: {
    title: "Explore | Along",
    description:
      "Explore trending travel routes, discover new destinations, and find inspiration for your next adventure on Along.",
    type: "website",
    url: "/explore",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore | Along",
    description:
      "Explore trending travel routes, discover new destinations, and find inspiration for your next adventure on Along.",
  },
};

export default function ExplorePage() {
  return (
    <div>
      <h1>Explore</h1>
      {/* Explore content will be implemented here */}
    </div>
  );
}

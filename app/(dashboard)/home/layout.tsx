import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover and share travel routes with the Along community. Connect with fellow travelers, bookmark your favorite routes, and plan your next adventure.",
  keywords: [
    "home",
    "feed",
    "travel routes",
    "social travel",
    "Along",
    "share routes",
    "discover destinations",
  ],
  openGraph: {
    title: "Home | Along",
    description:
      "Discover and share travel routes with the Along community. Connect with fellow travelers, bookmark your favorite routes, and plan your next adventure.",
    type: "website",
    url: "/home",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home | Along",
    description:
      "Discover and share travel routes with the Along community. Connect with fellow travelers, bookmark your favorite routes, and plan your next adventure.",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

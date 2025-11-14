import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks",
  description:
    "Access your bookmarked travel routes and destinations. Revisit and plan your adventures with your saved content on Along.",
  keywords: [
    "bookmarks",
    "saved routes",
    "favorites",
    "Along",
    "saved posts",
    "my bookmarks",
  ],
  openGraph: {
    title: "Bookmarks | Along",
    description:
      "Access your bookmarked travel routes and destinations. Revisit and plan your adventures with your saved content on Along.",
    type: "website",
    url: "/bookmarks",
  },
  twitter: {
    card: "summary",
    title: "Bookmarks | Along",
    description:
      "Access your bookmarked travel routes and destinations. Revisit and plan your adventures with your saved content on Along.",
  },
};

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

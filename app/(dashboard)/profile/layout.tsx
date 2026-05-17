import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "View and edit your Along profile. Manage your posts, followers, and travel experiences.",
  keywords: [
    "profile",
    "user profile",
    "my profile",
    "Along",
    "edit profile",
    "my posts",
  ],
  openGraph: {
    title: "Profile | Along",
    description:
      "View and edit your Along profile. Manage your posts, followers, and travel experiences.",
    type: "profile",
    url: "/profile",
  },
  twitter: {
    card: "summary",
    title: "Profile | Along",
    description:
      "View and edit your Along profile. Manage your posts, followers, and travel experiences.",
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

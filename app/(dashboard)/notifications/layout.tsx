import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description:
    "View your notifications and stay updated with likes, comments, follows, and mentions on Along.",
  keywords: [
    "notifications",
    "updates",
    "alerts",
    "Along",
    "activity",
    "mentions",
  ],
  openGraph: {
    title: "Notifications | Along",
    description:
      "View your notifications and stay updated with likes, comments, follows, and mentions on Along.",
    type: "website",
    url: "/notifications",
  },
  twitter: {
    card: "summary",
    title: "Notifications | Along",
    description:
      "View your notifications and stay updated with likes, comments, follows, and mentions on Along.",
  },
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

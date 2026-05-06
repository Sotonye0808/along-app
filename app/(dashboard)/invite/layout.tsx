import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Invite Friends | Along",
  description: "Invite your friends to Along and earn reward points for every accepted invite.",
  openGraph: {
    title: "Invite Friends | Along",
    description: "Invite your friends to Along and earn reward points for every accepted invite.",
    type: "website",
    url: "/invite",
  },
  twitter: {
    card: "summary",
    title: "Invite Friends | Along",
    description: "Invite your friends to Along and earn reward points for every accepted invite.",
  },
};

export default function InviteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

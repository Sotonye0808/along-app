import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Events | Along",
  description: "Discover travel events and community meetups powered by Along and Tega.",
  openGraph: {
    title: "Events | Along",
    description: "Discover travel events and community meetups powered by Along and Tega.",
    type: "website",
    url: "/events",
  },
  twitter: {
    card: "summary",
    title: "Events | Along",
    description: "Discover travel events and community meetups powered by Along and Tega.",
  },
};

export default function EventsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Analytics | Along",
  description: "View your engagement analytics — posts, likes, comments, followers and more.",
  openGraph: {
    title: "Analytics | Along",
    description: "View your engagement analytics on Along.",
    type: "website",
    url: "/analytics",
  },
};

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About | Along",
  description:
    "Learn about the Along team and our mission to make transport intelligence accessible across West Africa.",
  openGraph: {
    title: "About | Along",
    description: "Learn about the Along team and our mission.",
    type: "website",
    url: "/about",
    images: [{ url: "/assets/images/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Along",
    description: "Learn about the Along team and our mission.",
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

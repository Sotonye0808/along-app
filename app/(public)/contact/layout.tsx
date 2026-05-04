import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact | Along",
  description: "Get in touch with the Along team for questions, feedback, or partnerships.",
  openGraph: {
    title: "Contact | Along",
    description: "Get in touch with the Along team.",
    type: "website",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import { LoginForm } from "@/components/features/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Log in to Along to share your travel routes, discover new destinations, and connect with fellow travelers.",
  keywords: ["login", "sign in", "Along", "travel", "routes", "social travel"],
  openGraph: {
    title: "Login | Along",
    description:
      "Log in to Along to share your travel routes, discover new destinations, and connect with fellow travelers.",
    type: "website",
    url: "/login",
  },
  twitter: {
    card: "summary",
    title: "Login | Along",
    description:
      "Log in to Along to share your travel routes, discover new destinations, and connect with fellow travelers.",
  },
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <LoginForm />
    </div>
  );
}

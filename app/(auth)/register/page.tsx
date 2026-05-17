import { RegisterForm } from "@/components/features/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your Along account and start sharing your travel routes, discovering new destinations, and connecting with travelers worldwide.",
  keywords: [
    "sign up",
    "register",
    "join",
    "Along",
    "travel community",
    "create account",
  ],
  openGraph: {
    title: "Sign Up | Along",
    description:
      "Create your Along account and start sharing your travel routes, discovering new destinations, and connecting with travelers worldwide.",
    type: "website",
    url: "/register",
  },
  twitter: {
    card: "summary",
    title: "Sign Up | Along",
    description:
      "Create your Along account and start sharing your travel routes, discovering new destinations, and connecting with travelers worldwide.",
  },
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <RegisterForm />
    </div>
  );
}

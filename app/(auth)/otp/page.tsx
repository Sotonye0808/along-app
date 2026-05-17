import { OtpForm } from "@/components/features/auth/OtpForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Account",
  description:
    "Verify your Along account to complete registration and start sharing your travel experiences.",
  keywords: ["verify", "OTP", "verification", "Along", "account activation"],
  openGraph: {
    title: "Verify Account | Along",
    description:
      "Verify your Along account to complete registration and start sharing your travel experiences.",
    type: "website",
    url: "/otp",
  },
  twitter: {
    card: "summary",
    title: "Verify Account | Along",
    description:
      "Verify your Along account to complete registration and start sharing your travel experiences.",
  },
};

export default function OtpPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <OtpForm />
    </div>
  );
}

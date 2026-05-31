import Image from "next/image";
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
    <div className="flex min-h-screen">
      {/* Brand Panel - 40% on desktop */}
      <div className="hidden lg:flex lg:w-2/5 bg-[linear-gradient(135deg,#00623B_0%,#003D24_100%)] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center max-w-lg">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image src="/logo-icon.svg" alt="Along" width={48} height={48} className="w-12 h-12" />
            <span className="text-4xl font-bold text-white tracking-tight">Along</span>
          </div>
          <h1 className="text-3xl font-semibold text-white mb-3">
            Verify Your Account
          </h1>
          <p className="text-white/80 text-lg">
            Enter the code sent to your email to activate your account.
          </p>
        </div>
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="1"/>
            <circle cx="300" cy="150" r="120" fill="none" stroke="white" strokeWidth="1"/>
            <circle cx="200" cy="300" r="100" fill="none" stroke="white" strokeWidth="1"/>
            <path d="M50,200 Q150,100 250,200 T450,200" fill="none" stroke="white" strokeWidth="1"/>
            <path d="M0,300 Q100,250 200,300 T400,300" fill="none" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl"/>
        <div className="absolute top-20 left-10 w-48 h-48 rounded-full bg-white/5 blur-3xl"/>
      </div>

      {/* Form Panel - 60% on desktop */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 sm:p-8 bg-[var(--color-bg-elevated)]/50">
        <div className="w-full max-w-md">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-base)] p-8 shadow-sm">
            <OtpForm />
          </div>
        </div>
      </div>
    </div>
  );
}

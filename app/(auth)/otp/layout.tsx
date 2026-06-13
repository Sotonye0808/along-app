import { buildMetadata } from "@/app/lib/utils/metadata";

export const metadata = buildMetadata({
  title: "Verify Email",
  description: "Verify your email address to activate your Along account.",
  path: "/otp",
  noIndex: true,
});

export default function OtpLayout({ children }: { children: React.ReactNode }) {
  return children;
}

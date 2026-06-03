import { buildMetadata } from "@/app/lib/utils/metadata";

export const metadata = buildMetadata({
  title: "Sign In",
  description: "Sign in to your Along account to share and discover routes.",
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

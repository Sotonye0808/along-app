import { buildMetadata } from "@/app/lib/utils/metadata";

export const metadata = buildMetadata({
  title: "Create Account",
  description: "Join Along and start sharing routes with the community.",
  path: "/register",
  noIndex: true,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

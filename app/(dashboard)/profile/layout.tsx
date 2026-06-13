import { buildMetadata } from "@/app/lib/utils/metadata";

export const metadata = buildMetadata({
  title: "Profile",
  description: "Your route contributions and community reputation.",
  path: "/profile",
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { buildMetadata } from "@/app/lib/utils/metadata";

export const metadata = buildMetadata({
  title: "Notifications",
  description: "Stay updated on route changes and community activity.",
  path: "/notifications",
});

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

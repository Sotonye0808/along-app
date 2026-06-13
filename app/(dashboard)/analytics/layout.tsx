import { buildMetadata } from "@/app/lib/utils/metadata";

export const metadata = buildMetadata({
  title: "Analytics",
  description: "Track your route engagement and community impact.",
  path: "/analytics",
});

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

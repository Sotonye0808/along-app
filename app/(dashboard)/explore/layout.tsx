import { buildMetadata } from "@/app/lib/utils/metadata";

export const metadata = buildMetadata({
  title: "Explore",
  description: "Discover routes near you on the interactive map.",
  path: "/explore",
});

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}

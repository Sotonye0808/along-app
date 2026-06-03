import { buildMetadata } from "@/app/lib/utils/metadata";

export const metadata = buildMetadata({
  title: "Bookmarks",
  description: "Your saved routes for quick reference.",
  path: "/bookmarks",
});

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}

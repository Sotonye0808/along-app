import { buildMetadata } from "@/app/lib/utils/metadata";

export const metadata = buildMetadata({
  title: "Home",
  description: "Your feed of trusted route information from the community.",
  path: "/home",
  noIndex: true,
});

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { buildMetadata } from "@/app/lib/utils/metadata";
import AboutPageClient from "./AboutPageClient";

export const metadata = buildMetadata({
  title: "About",
  description: "Learn about Along's mission to transform urban transit in West Africa through community-driven route intelligence.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPageClient />;
}

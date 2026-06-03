import { buildMetadata } from "@/app/lib/utils/metadata";
import ContactPageClient from "./ContactPageClient";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with the Along team. We read every message and reply within 24 hours.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactPageClient />;
}

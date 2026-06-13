import type { Metadata } from "next";
import { PAGE_META } from "@/app/lib/config";
import { DEFAULT_FAQ_ITEMS } from "@/app/lib/config";
import { buildPublicMetadata } from "@/app/lib/utils/metadata";
import { faqPageSchema, websiteSchema } from "@/app/lib/utils/structuredData";
import FaqClient from "./FaqClient";

export const metadata: Metadata = buildPublicMetadata(
  PAGE_META.faq.title,
  PAGE_META.faq.description,
  "/faq",
);

const jsonLd = {
  ...websiteSchema(),
  ...faqPageSchema(
    DEFAULT_FAQ_ITEMS.flatMap((cat) => cat.items),
  ),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqClient categories={DEFAULT_FAQ_ITEMS} />
    </>
  );
}

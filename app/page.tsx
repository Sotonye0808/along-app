import type { Metadata } from "next";
import {
  buildMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  getSiteUrl,
} from "@/lib/utils/metadata";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/utils/structuredData";

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${SITE_NAME} - Share Your Travel Routes`,
    description: `${SITE_DESCRIPTION} Connect with fellow travelers, bookmark routes, and plan your next adventure.`,
    pathname: "/",
    keywords: ["travel", "routes", "community", "Along", "map", "transit"],
  }),
};

export default function HomePage() {
  const baseUrl = getSiteUrl();
  const organizationSchema = generateOrganizationSchema(baseUrl);
  const websiteSchema = generateWebSiteSchema(baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Along</h1>
          <p className="mb-8 text-[var(--color-text-secondary)]">
            Share and discover amazing travel routes
          </p>
          <div className="space-x-4">
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-[#00623B] text-white rounded-lg hover:bg-[#004d2e] transition">
              Login
            </a>
            <a
              href="/register"
              className="inline-block px-6 py-3 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-bg-elevated)] transition">
              Sign Up
            </a>
          </div>

          <div className="mx-auto my-8">
            <a
              href="/home"
              className="text-[#00623B] font-semibold hover:underline hover:text-[#00623B]">
              Visit as guest
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

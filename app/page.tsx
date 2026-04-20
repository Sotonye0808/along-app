import Link from "next/link";
import { APP_ROUTES } from "@/lib/constants";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/utils/structuredData";

export default function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const organizationSchema = generateOrganizationSchema(baseUrl);
  const websiteSchema = generateWebSiteSchema(baseUrl);

  return (
    <>
      {/* JSON-LD Structured Data */}
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
          <p className="text-gray-600 mb-8">
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
              className="inline-block px-6 py-3 border border-[#00623B] text-[#00623B] rounded-lg hover:bg-gray-50 transition">
              Sign Up
            </a>
          </div>

          <div className="mx-auto my-8">
            <Link
              href={APP_ROUTES.DASHBOARD}
              className={
                "text-[#00623B] font-semibold hover:underline hover:text-[#00623B]"
              }>
              Visit as guest
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

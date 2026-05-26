import type { Metadata } from "next";
import Image from "next/image";
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
import {
  Route,
  ShieldCheck,
  Users,
  MapPin,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${SITE_NAME} - Share Your Travel Routes`,
    description: `${SITE_DESCRIPTION} Connect with fellow travelers, bookmark routes, and plan your next adventure.`,
    pathname: "/",
    keywords: ["travel", "routes", "community", "Along", "map", "transit"],
  }),
};

const features = [
  {
    icon: Route,
    title: "Route Sharing",
    description:
      "Share detailed transport routes with step-by-step directions, vehicle info, and fare estimates.",
  },
  {
    icon: ShieldCheck,
    title: "Trust Scores",
    description:
      "Community-validated routes with trust badges so you always know which routes are reliable.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Connect with fellow travelers, follow route creators, and discover the best paths together.",
  },
];

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

      <div className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
            <svg className="h-full w-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
              <circle cx="150" cy="200" r="120" fill="none" stroke="var(--color-primary)" strokeWidth="2"/>
              <circle cx="650" cy="300" r="160" fill="none" stroke="var(--color-primary)" strokeWidth="2"/>
              <circle cx="400" cy="600" r="140" fill="none" stroke="var(--color-primary)" strokeWidth="2"/>
              <path d="M50,400 Q200,250 400,350 T750,250" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="8 8"/>
              <path d="M0,600 Q200,450 450,550 T800,450" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="8 8"/>
              <circle cx="400" cy="350" r="8" fill="var(--color-primary)"/>
              <circle cx="200" cy="280" r="6" fill="var(--color-primary-light)"/>
              <circle cx="600" cy="420" r="6" fill="var(--color-primary-light)"/>
            </svg>
          </div>

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <Image src="/logo-icon.svg" alt="Along" width={40} height={40} className="h-10 w-10" />
              <span className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Along
              </span>
            </div>

            {/* Hero heading */}
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
              Navigate{" "}
              <span className="text-[var(--color-primary)]">Together</span>
            </h1>

            {/* Tagline */}
            <p className="mx-auto mb-10 max-w-xl text-lg text-[var(--color-text-secondary)] sm:text-xl">
              Share verified routes, discover trusted paths, and navigate your
              city with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-[var(--color-primary-light)] hover:shadow-[0_8px_32px_rgba(0,98,59,0.15)]"
              >
                Get Started
                <ArrowRight size={18} />
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-primary)] bg-transparent px-8 py-3.5 text-base font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)]/5"
              >
                Sign In
              </a>
            </div>

            {/* Guest link */}
            <div className="mt-6">
              <a
                href="/home"
                className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                Continue as guest →
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <MapPin size={20} className="text-[var(--color-primary)]" />
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
                Everything you need to travel smarter
              </h2>
              <p className="mt-3 text-[var(--color-text-secondary)]">
                Join a community of travelers sharing verified routes every day.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-base)] p-6 transition-all hover:shadow-[0_8px_32px_rgba(0,98,59,0.10)] hover:-translate-y-1"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <Icon size={24} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 py-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Image src="/logo-icon.svg" alt="" width={24} height={24} className="h-6 w-6" />
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Along
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Navigate Together
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-[var(--color-text-muted)]">
              <a href="/about" className="hover:text-[var(--color-primary)]">About</a>
              <a href="/privacy" className="hover:text-[var(--color-primary)]">Privacy</a>
              <a href="/terms" className="hover:text-[var(--color-primary)]">Terms</a>
              <a href="/contact" className="hover:text-[var(--color-primary)]">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-text-muted)]">
                &copy; {new Date().getFullYear()} Along
              </span>
              <a
                href="https://sotonye-dagogo.is-a.dev"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[var(--color-text-muted)] opacity-60 hover:opacity-100"
              >
                Built by S.D
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

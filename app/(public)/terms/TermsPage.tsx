import React from "react";
import { FileText } from "lucide-react";

export default function TermsPage(): React.ReactElement {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5">
          <FileText size={24} className="text-[var(--color-primary)]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Terms of Service
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Last updated: April 2026
          </p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-[var(--color-text-primary)]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            By accessing or using Along, you agree to be bound by these Terms of
            Service. If you do not agree, please do not use the platform.
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">2. Eligibility</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            You must be at least 13 years old to use Along. By using the platform,
            you represent that you meet this requirement and have the legal
            capacity to enter into these Terms.
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">3. Your Content</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            You retain ownership of the route posts and other content you create
            on Along. By posting, you grant Along a non-exclusive, royalty-free
            licence to display and distribute your content within the platform. You
            are responsible for ensuring your content is accurate and does not
            infringe third-party rights.
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">4. Prohibited Conduct</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            You agree not to post false or misleading route information, harass
            other users, attempt to reverse-engineer the platform, or use Along
            for any unlawful purpose. Along reserves the right to suspend or
            terminate accounts that violate these rules.
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">5. Disclaimer of Warranties</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            Along is provided &quot;as is&quot; without warranties of any kind. Route
            information is user-generated and may not be accurate. Always verify
            routes before relying on them for travel.
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">6. Changes to Terms</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            We may modify these Terms at any time. Continued use of Along after
            changes are posted constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">7. Contact</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            Questions about these Terms? Reach us at{" "}
            <a
              href="mailto:legal@along.app"
              className="text-[var(--color-primary)] hover:underline">
              legal@along.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

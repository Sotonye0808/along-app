import React from "react";
import { Shield } from "lucide-react";

export default function PrivacyPage(): React.ReactElement {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5">
          <Shield size={24} className="text-[var(--color-primary)]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Last updated: April 2026
          </p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-[var(--color-text-primary)]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            When you create an Along account, we collect your name, email address,
            and password (stored as a secure hash). If you sign in with Google, we
            receive your Google profile information. Route posts you create —
            including text, images, and location data you voluntarily provide —
            are stored to power the Along feed.
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            We use your information to operate and improve Along: to display your
            profile and posts, personalise your feed, send you notifications you
            opt into, and detect and prevent abuse. We do not sell your personal
            data to third parties.
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">3. Data Retention</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            Your data is retained for as long as your account is active. You may
            delete your account at any time from your profile settings. Deleted
            account data is purged within 30 days, except where retention is
            required by law.
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">4. Cookies</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            Along uses essential cookies to maintain your login session and
            optional analytics cookies to understand how the app is used. You can
            manage cookie preferences through the consent banner shown on first
            visit.
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">5. Your Rights</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            Depending on your jurisdiction, you may have the right to access,
            correct, or delete your personal data, or to object to certain
            processing. To exercise these rights, contact us at{" "}
            <a
              href="mailto:privacy@along.app"
              className="text-[var(--color-primary)] hover:underline">
              privacy@along.app
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">6. Changes to This Policy</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            We may update this policy from time to time. When we do, we will
            update the &quot;last updated&quot; date above and, for material changes,
            notify you via email or in-app notification.
          </p>
        </section>
      </div>
    </div>
  );
}

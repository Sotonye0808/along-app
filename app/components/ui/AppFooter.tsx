import React from "react";
import Link from "next/link";
import { FOOTER_CONFIG } from "@/lib/config";

export function AppFooter(): React.ReactElement {
  const footerSections = [
    ...FOOTER_CONFIG.sections,
    {
      title: "Social",
      links: FOOTER_CONFIG.social,
      external: true,
    },
  ];

  return (
    <footer className="mt-10 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[var(--color-primary)]">
              {FOOTER_CONFIG.brand.name}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {FOOTER_CONFIG.brand.tagline}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-[var(--color-text-primary)]">
                {section.title}
              </h4>
              <ul className="mt-2 space-y-1.5 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {"external" in section && section.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
          <span>
            © {new Date().getFullYear()} {FOOTER_CONFIG.brand.name}
          </span>
          <a
            href={FOOTER_CONFIG.devCredit.href}
            target="_blank"
            rel="noreferrer"
            className="opacity-60 hover:opacity-100">
            {FOOTER_CONFIG.devCredit.label}
          </a>
        </div>
      </div>
    </footer>
  );
}

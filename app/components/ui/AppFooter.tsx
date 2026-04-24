import React from "react";
import Link from "next/link";
import { FOOTER_CONFIG } from "@/lib/config";

export function AppFooter(): React.ReactElement {
  return (
    <footer className="mt-10 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <h3 className="text-xl font-bold text-[var(--color-primary)]">
              {FOOTER_CONFIG.brand.name}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {FOOTER_CONFIG.brand.tagline}
            </p>
          </div>

          {FOOTER_CONFIG.sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-[var(--color-text-primary)]">
                {section.title}
              </h4>
              <ul className="mt-2 space-y-1.5 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)]">
              Social
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm">
              {FOOTER_CONFIG.social.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
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

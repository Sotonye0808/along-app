import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { APP_ROUTES } from "@/lib/constants";
import { AppFooter } from "@/components/ui/AppFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-elevated)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href={APP_ROUTES.DASHBOARD}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Along
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      <AppFooter />
    </div>
  );
}

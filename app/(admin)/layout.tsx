"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bug,
  FileText,
  LayoutDashboard,
  Settings,
  Star,
  Users,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { AppSpinner } from "@/components/ui/AppSpinner";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Posts", href: "/admin/posts", icon: FileText },
  { label: "Bug Reports", href: "/admin/bugs", icon: Bug },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Config", href: "/admin/config", icon: Settings },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <AppSpinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    router.replace("/home");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-elevated)]">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-base)] md:flex md:flex-col">
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <span className="text-lg font-semibold text-[var(--color-primary)]">
            Along Admin
          </span>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]",
                ].join(" ")}>
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </main>
    </div>
  );
}

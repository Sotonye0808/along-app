"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Bug, FileText, Star, Users } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppSpinner } from "@/components/ui/AppSpinner";
import type { LucideIcon } from "lucide-react";

interface AdminSummary {
  users: number;
  posts: number;
  bugReports: number;
  reviews: number;
}

interface AdminStat {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  href: string;
}

export default function AdminDashboardPage(): React.ReactElement {
  const [stats, setStats] = useState<AdminStat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/summary", { credentials: "include" });
      const summary = (await res.json()) as AdminSummary;

      setStats([
        {
          label: "Users",
          value: summary.users,
          icon: Users,
          color: "text-[var(--color-primary)]",
          href: "/admin/users",
        },
        {
          label: "Posts",
          value: summary.posts,
          icon: FileText,
          color: "text-[var(--color-success-text)]",
          href: "/admin/posts",
        },
        {
          label: "Bug Reports",
          value: summary.bugReports,
          icon: Bug,
          color: "text-[var(--color-error-text)]",
          href: "/admin/bugs",
        },
        {
          label: "Reviews",
          value: summary.reviews,
          icon: Star,
          color: "text-[var(--color-warning-text)]",
          href: "/admin/reviews",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <AppSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Live overview of users, posts, moderation, and review activity.
          </p>
        </div>
        <AppButton variant="secondary" href="/admin/config">
          Open config
        </AppButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <AppCard key={label} variant="default" href={href} hover>
            <div className="flex items-start gap-3">
              <Icon size={20} className={color} aria-hidden="true" />
              <div>
                <div className="text-2xl font-semibold text-[var(--color-text-primary)]">
                  {value.toLocaleString()}
                </div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  {label}
                </div>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}

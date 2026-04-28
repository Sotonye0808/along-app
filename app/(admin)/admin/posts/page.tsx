"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { AppTable } from "@/components/ui/AppTable";
import type { AppTableColumn } from "@/components/ui/AppTable";
import { TrustBadge } from "@/components/ui/TrustBadge";

const columns: AppTableColumn<Post>[] = [
  {
    key: "title",
    title: "Title",
    render: (_v, row) => (
      <Link
        href={`/posts/${row.id}`}
        className="font-medium text-[var(--color-text-primary)] hover:underline line-clamp-1">
        {row.title}
      </Link>
    ),
  },
  {
    key: "validity",
    title: "Trust",
    render: (_v, row) => <TrustBadge score={row.validityScore} size="small" />,
  },
  {
    key: "likes",
    title: "Likes",
    render: (_v, row) => formatNumber(row.likes),
  },
  {
    key: "comments",
    title: "Comments",
    render: (_v, row) => formatNumber(row.comments),
  },
  {
    key: "createdAt",
    title: "Posted",
    render: (_v, row) => formatDate(row.createdAt),
  },
];

export default function AdminPostsPage(): React.ReactElement {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/posts?limit=50", { credentials: "include" });
      if (res.ok) {
        const body = (await res.json()) as { data: Post[] } | Post[];
        setPosts(Array.isArray(body) ? body : body.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <AppSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Posts</h1>
      <AppTable<Post>
        columns={columns}
        data={posts}
        rowKey="id"
        rowHref={(row) => `/posts/${row.id}`}
        emptyState={{ title: "No posts found" }}
      />
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/utils/format";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { AppTable } from "@/components/ui/AppTable";
import type { AppTableColumn } from "@/components/ui/AppTable";
import { AppUserLabel } from "@/components/ui/AppUserLabel";
import { AppTag } from "@/components/ui/AppTag";

interface AdminUser {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
  _count?: { posts: number; followers: number };
}

const columns: AppTableColumn<AdminUser>[] = [
  {
    key: "user",
    title: "User",
    render: (_v, row) => (
      <AppUserLabel
        user={{
          userName: row.userName,
          firstName: row.firstName,
          lastName: row.lastName,
          verified: row.verified,
        }}
        linkToProfile
      />
    ),
  },
  { key: "email", title: "Email", dataIndex: "email" },
  {
    key: "role",
    title: "Role",
    render: (_v, row) => (
      <AppTag
        label={row.role}
        variant={row.role === "ADMIN" ? "primary" : "default"}
        size="xs"
      />
    ),
  },
  {
    key: "posts",
    title: "Posts",
    render: (_v, row) => row._count?.posts ?? 0,
  },
  {
    key: "createdAt",
    title: "Joined",
    render: (_v, row) => formatDate(row.createdAt),
  },
];

export default function AdminUsersPage(): React.ReactElement {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/users?limit=50", {
        credentials: "include",
      });
      if (res.ok) {
        const body = (await res.json()) as { data: AdminUser[] } | AdminUser[];
        setUsers(Array.isArray(body) ? body : (body.data ?? []));
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
        <AppSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
        Users
      </h1>
      <AppTable<AdminUser>
        columns={columns}
        data={users}
        rowKey="id"
        rowHref={(row) => `/profile/${row.userName}`}
        emptyState={{ title: "No users found" }}
      />
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/utils/format";
import { AppDropdown } from "@/components/ui/AppDropdown";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { AppStatusDot } from "@/components/ui/AppStatusDot";
import { AppTable } from "@/components/ui/AppTable";
import type { AppTableColumn } from "@/components/ui/AppTable";
import { ModalService } from "@/lib/services/modalService";

interface BugReportRow {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  reporter: { id: string; userName: string; firstName: string; lastName: string };
}

const STATUS_OPTIONS = ["OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function getStatusVariant(
  status: string,
): "default" | "success" | "warning" | "error" | "info" {
  switch (status) {
    case "OPEN": return "error";
    case "TRIAGED": return "warning";
    case "IN_PROGRESS": return "info";
    case "RESOLVED": return "success";
    case "CLOSED": return "default";
    default: return "default";
  }
}

export default function AdminBugsPage(): React.ReactElement {
  const [reports, setReports] = useState<BugReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/bug-reports", { credentials: "include" });
      if (res.ok) {
        const body = (await res.json()) as { data: BugReportRow[] } | BugReportRow[];
        setReports(Array.isArray(body) ? body : body.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStatusChange(reportId: string, newStatus: string): Promise<void> {
    const confirmed = await ModalService.confirm({
      title: "Change bug status",
      description: `Set status to "${newStatus}"?`,
      confirmLabel: "Change",
      destructive: false,
    });
    if (!confirmed) return;

    await fetch(`/api/bug-reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: newStatus }),
    });
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)),
    );
  }

  const columns: AppTableColumn<BugReportRow>[] = [
    {
      key: "title",
      title: "Title",
      render: (_v, row) => (
        <span className="line-clamp-1 font-medium text-[var(--color-text-primary)]">
          {row.title}
        </span>
      ),
    },
    { key: "category", title: "Category", dataIndex: "category" },
    {
      key: "status",
      title: "Status",
      render: (_v, row) => (
        <div className="flex items-center gap-1.5">
          <AppStatusDot variant={getStatusVariant(row.status)} />
          <span className="text-sm">{row.status.replace(/_/g, " ")}</span>
        </div>
      ),
    },
    {
      key: "reporter",
      title: "Reporter",
      render: (_v, row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          @{row.reporter.userName}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Reported",
      render: (_v, row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      title: "",
      render: (_v, row) => (
        <AppDropdown
          items={STATUS_OPTIONS.filter((s) => s !== row.status).map((s) => ({
            key: s,
            label: s.replace(/_/g, " "),
            onClick: () => void handleStatusChange(row.id, s),
          }))}
          label="Change status"
          size="sm"
          variant="ghost"
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <AppSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
        Bug Reports
      </h1>
      <AppTable<BugReportRow>
        columns={columns}
        data={reports}
        rowKey="id"
        emptyState={{ title: "No bug reports", description: "Nothing to triage yet." }}
      />
    </div>
  );
}

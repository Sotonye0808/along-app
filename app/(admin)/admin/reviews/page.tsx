"use client";

import React, { useCallback, useEffect, useState } from "react";
import { App } from "antd";
import {
  REVIEW_STATUS_CONFIG,
  REVIEW_STATUS_FILTERS,
  REVIEW_STATUS_OPTIONS,
} from "@/lib/config";
import { AppButton } from "@/components/ui/AppButton";
import type { AvatarConfig } from "@/lib/config/avatar";
import { AppCard } from "@/components/ui/AppCard";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { AppTable } from "@/components/ui/AppTable";
import type { AppTableColumn } from "@/components/ui/AppTable";
import { AppTag } from "@/components/ui/AppTag";
import { AppUserLabel } from "@/components/ui/AppUserLabel";
import { formatDate } from "@/lib/utils/format";
import { ModalService } from "@/lib/services/modalService";

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewer: {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    avatarConfig?: AvatarConfig | null;
    verified?: boolean;
  };
  reviewee: {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    avatarConfig?: AvatarConfig | null;
    verified?: boolean;
  };
}

export default function AdminReviewsPage(): React.ReactElement {
  const { message } = App.useApp();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (status !== "ALL") {
        params.set("status", status);
      }
      params.set("limit", "50");

      const res = await fetch(`/api/reviews?${params.toString()}`, {
        credentials: "include",
      });

      if (res.ok) {
        const body = (await res.json()) as { data: ReviewRow[] } | ReviewRow[];
        setReviews(Array.isArray(body) ? body : (body.data ?? []));
      }
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStatusChange(
    reviewId: string,
    nextStatus: ReviewRow["status"],
  ): Promise<void> {
    const confirmed = await ModalService.confirm({
      title: "Update review status",
      description: `Change this review to ${REVIEW_STATUS_CONFIG[nextStatus].label.toLowerCase()}?`,
      confirmLabel: "Update",
      destructive: false,
    });

    if (!confirmed) return;

    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!res.ok) {
      message.error("Failed to update review");
      return;
    }

    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, status: nextStatus } : review,
      ),
    );
    message.success("Review updated");
  }

  const columns: AppTableColumn<ReviewRow>[] = [
    {
      key: "reviewer",
      title: "Reviewer",
      render: (_v, row) => <AppUserLabel user={row.reviewer} linkToProfile />,
    },
    {
      key: "reviewee",
      title: "Reviewed user",
      render: (_v, row) => <AppUserLabel user={row.reviewee} linkToProfile />,
    },
    {
      key: "rating",
      title: "Rating",
      render: (_v, row) => (
        <AppTag label={`${row.rating}/5`} variant="primary" size="xs" />
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_v, row) => {
        const config = REVIEW_STATUS_CONFIG[row.status];
        const Icon = config.icon;
        return (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium"
            style={{ color: config.color }}>
            <Icon size={14} aria-hidden="true" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: "comment",
      title: "Comment",
      render: (_v, row) => (
        <span className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">
          {row.comment ?? "No comment provided."}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Submitted",
      render: (_v, row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      title: "",
      render: (_v, row) => (
        <div className="flex flex-wrap gap-2">
          {REVIEW_STATUS_OPTIONS.filter((item) => item !== row.status).map(
            (nextStatus) => (
              <AppButton
                key={nextStatus}
                variant={
                  nextStatus === "REJECTED" ? "destructive" : "secondary"
                }
                size="sm"
                onClick={() => void handleStatusChange(row.id, nextStatus)}>
                {REVIEW_STATUS_CONFIG[nextStatus].label}
              </AppButton>
            ),
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Reviews
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Approve or reject route trust reviews from the community.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {REVIEW_STATUS_FILTERS.map((filter) => (
            <AppButton
              key={filter.value}
              variant={status === filter.value ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatus(filter.value)}>
              {filter.label}
            </AppButton>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {REVIEW_STATUS_FILTERS.filter((filter) => filter.value !== "ALL").map(
          (filter) => {
            const count = reviews.filter(
              (review) => review.status === filter.value,
            ).length;
            const Icon = filter.icon;
            return (
              <AppCard key={filter.value} variant="default">
                <div className="flex items-start gap-3">
                  <Icon
                    size={20}
                    className="text-[var(--color-primary)]"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-2xl font-semibold text-[var(--color-text-primary)]">
                      {count.toLocaleString()}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {filter.label}
                    </div>
                  </div>
                </div>
              </AppCard>
            );
          },
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <AppSpinner size={32} />
        </div>
      ) : (
        <AppTable<ReviewRow>
          columns={columns}
          data={reviews}
          rowKey="id"
          emptyState={{
            title: "No reviews found",
            description: "There are no reviews to moderate right now.",
          }}
        />
      )}
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart2,
  BookmarkIcon,
  Download,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { App } from "antd";
import { Line, Column } from "@ant-design/charts";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { AppButton } from "@/components/ui/AppButton";
import { AppTable, type AppTableColumn } from "@/components/ui/AppTable";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { useAuth } from "../../providers/AuthProvider";

interface OverviewMetrics {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
  totalViews: number;
  totalShares: number;
  followerCount: number;
  followingCount: number;
  totalInvited: number;
}

interface TimelinePoint {
  month: string;
  likes: number;
  comments: number;
  posts: number;
}

interface RegionPoint {
  region: string;
  count: number;
}

interface TopPost {
  id: string;
  title: string;
  likes: number;
  comments: number;
  bookmarks: number;
}

interface AnalyticsData {
  overview: OverviewMetrics;
  timeline: TimelinePoint[];
  topRegions: RegionPoint[];
  topPosts: TopPost[];
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <AppCard variant="elevated" padding="sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-[var(--color-text-primary)] leading-tight">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
        </div>
      </div>
    </AppCard>
  );
}

const TOP_POSTS_COLUMNS: AppTableColumn<TopPost>[] = [
  {
    key: "title",
    title: "Route",
    render: (_v, row) => (
      <span className="text-sm text-[var(--color-text-primary)] line-clamp-1 font-medium">
        {row.title}
      </span>
    ),
  },
  { key: "likes", title: "Likes", dataIndex: "likes", align: "right" },
  { key: "comments", title: "Comments", dataIndex: "comments", align: "right" },
  { key: "bookmarks", title: "Bookmarks", dataIndex: "bookmarks", align: "right" },
];

function exportCsv(topPosts: TopPost[]) {
  const header = "Title,Likes,Comments,Bookmarks\n";
  const rows = topPosts
    .map((p) => `"${p.title.replace(/"/g, '""')}",${p.likes},${p.comments},${p.bookmarks}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "along-analytics.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<AnalyticsData>(API_ENDPOINTS.ANALYTICS);
      setData(res.data);
    } catch {
      message.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    if (user) void fetchAnalytics();
  }, [user, fetchAnalytics]);

  // Flatten timeline for @ant-design/charts Line chart (multiple series)
  const timelineChartData = useMemo(() => {
    if (!data) return [];
    const points: Array<{ month: string; value: number; type: string }> = [];
    for (const pt of data.timeline) {
      points.push({ month: pt.month, value: pt.likes, type: "Likes" });
      points.push({ month: pt.month, value: pt.comments, type: "Comments" });
      points.push({ month: pt.month, value: pt.posts, type: "Posts" });
    }
    return points;
  }, [data]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <AppEmptyState title="Login required" description="Please log in to view your analytics." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <BarChart2 size={24} className="text-[var(--color-primary)]" aria-hidden="true" />
            Analytics
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Your engagement overview
          </p>
        </div>
        {data && (
          <AppButton
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => exportCsv(data.topPosts)}
          >
            Export CSV
          </AppButton>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <AppSpinner size={32} />
        </div>
      ) : !data ? (
        <AppEmptyState title="No data" description="Post a route to start seeing analytics." />
      ) : (
        <>
          {/* Overview metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <MetricCard
              label="Posts"
              value={data.overview.totalPosts}
              icon={<TrendingUp size={18} className="text-[var(--color-primary)]" />}
            />
            <MetricCard
              label="Likes"
              value={data.overview.totalLikes}
              icon={<Heart size={18} className="text-[var(--color-primary)]" />}
            />
            <MetricCard
              label="Comments"
              value={data.overview.totalComments}
              icon={<MessageCircle size={18} className="text-[var(--color-primary)]" />}
            />
            <MetricCard
              label="Bookmarks"
              value={data.overview.totalBookmarks}
              icon={<BookmarkIcon size={18} className="text-[var(--color-primary)]" />}
            />
            <MetricCard
              label="Followers"
              value={data.overview.followerCount}
              icon={<Users size={18} className="text-[var(--color-primary)]" />}
            />
            <MetricCard
              label="Shares"
              value={data.overview.totalShares}
              icon={<Share2 size={18} className="text-[var(--color-primary)]" />}
            />
            <MetricCard
              label="Invited"
              value={data.overview.totalInvited}
              icon={<Users size={18} className="text-[var(--color-primary)]" />}
            />
            <MetricCard
              label="Views"
              value={data.overview.totalViews}
              icon={<BarChart2 size={18} className="text-[var(--color-primary)]" />}
            />
          </div>

          {/* Engagement timeline */}
          {timelineChartData.length > 0 && (
            <AppCard variant="elevated">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                Engagement over time
              </h2>
              <Line
                data={timelineChartData}
                xField="month"
                yField="value"
                colorField="type"
                style={{ height: 220 }}
                theme={
                  typeof window !== "undefined" &&
                  window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "classicDark"
                    : "classic"
                }
              />
            </AppCard>
          )}

          {/* Top regions */}
          {data.topRegions.length > 0 && (
            <AppCard variant="elevated">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                Routes by region
              </h2>
              <Column
                data={data.topRegions}
                xField="region"
                yField="count"
                style={{ height: 180 }}
                theme={
                  typeof window !== "undefined" &&
                  window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "classicDark"
                    : "classic"
                }
              />
            </AppCard>
          )}

          {/* Top posts table */}
          {data.topPosts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                Top routes by likes
              </h2>
              <AppTable<TopPost>
                columns={TOP_POSTS_COLUMNS}
                data={data.topPosts}
                rowKey="id"
                rowHref={(row) => `/posts/${row.id}`}
                size="small"
                pagination={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

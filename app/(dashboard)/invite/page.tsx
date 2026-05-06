"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Copy, Gift, Trophy, Users } from "lucide-react";
import { App } from "antd";
import { QRCodeSVG } from "qrcode.react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { AppTable, type AppTableColumn } from "@/components/ui/AppTable";
import { AppUserLabel } from "@/components/ui/AppUserLabel";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { INVITE_CONFIG } from "@/lib/config/inviteConfig";
import { POINTS_CONFIG, PointsAction } from "@/lib/config/rewards";
import { useAuth } from "../../providers/AuthProvider";

interface InviteData {
  code: string;
  inviteUrl: string;
  inviterUserName: string;
  invitedCount: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  invitedCount: number;
}

const LEADERBOARD_COLUMNS: AppTableColumn<LeaderboardEntry>[] = [
  {
    key: "rank",
    title: "#",
    render: (_v, row) => (
      <span className="font-bold text-[var(--color-primary)]">#{row.rank}</span>
    ),
    width: 48,
  },
  {
    key: "user",
    title: "Inviter",
    render: (_v, row) => (
      <AppUserLabel
        user={{
          userName: row.userName,
          firstName: row.firstName,
          lastName: row.lastName,
          avatar: undefined,
        }}
        avatarSize={32}
      />
    ),
  },
  {
    key: "invitedCount",
    title: "Invited",
    dataIndex: "invitedCount",
    align: "right",
    render: (v) => (
      <span className="font-semibold text-[var(--color-text-primary)]">
        {String(v)}
      </span>
    ),
  },
];

export default function InvitePage() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ invite: InviteData; leaderboard: LeaderboardEntry[] }>(
        API_ENDPOINTS.INVITES,
      );
      setInvite(res.data.invite);
      setLeaderboard(res.data.leaderboard);
    } catch {
      message.error("Failed to load invite data");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    if (user) void fetchData();
  }, [user, fetchData]);

  const handleCopy = useCallback(() => {
    if (!invite) return;
    navigator.clipboard.writeText(invite.inviteUrl).then(() => {
      message.success("Invite link copied!");
    }).catch(() => {
      message.error("Could not copy to clipboard");
    });
  }, [invite, message]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <AppEmptyState title="Login required" description="Please log in to see your invite link." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Gift size={24} className="text-[var(--color-primary)]" aria-hidden="true" />
          Invite Friends
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Earn{" "}
          <strong>{POINTS_CONFIG[PointsAction.INVITE_ACCEPTED]} points</strong> for every
          friend who joins with your link (up to {INVITE_CONFIG.maxInvitesPerDay}/day).
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <AppSpinner size={32} />
        </div>
      ) : (
        <>
          {/* Invite card */}
          <AppCard variant="elevated">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              {invite && (
                <div className="shrink-0 rounded-xl border border-[var(--color-border)] p-2 bg-white">
                  <QRCodeSVG value={invite.inviteUrl} size={120} />
                </div>
              )}
              <div className="flex-1 space-y-3 w-full">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Your invite code
                  </p>
                  <p className="text-3xl font-bold tracking-widest text-[var(--color-primary)] font-mono mt-0.5">
                    {invite?.code ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={invite?.inviteUrl ?? ""}
                    className="flex-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] font-mono truncate"
                    aria-label="Invite URL"
                  />
                  <AppButton
                    variant="secondary"
                    size="sm"
                    icon={Copy}
                    onClick={handleCopy}
                    ariaLabel="Copy invite link"
                  >
                    Copy
                  </AppButton>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  <Users size={12} className="inline mr-1" aria-hidden="true" />
                  {invite?.invitedCount ?? 0} friend
                  {invite?.invitedCount !== 1 ? "s" : ""} invited so far
                </p>
              </div>
            </div>
          </AppCard>

          {/* Leaderboard */}
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
              Top Inviters
            </h2>
            {leaderboard.length === 0 ? (
              <AppEmptyState
                title="No inviters yet"
                description="Be the first to invite a friend!"
              />
            ) : (
              <AppTable<LeaderboardEntry>
                columns={LEADERBOARD_COLUMNS}
                data={leaderboard}
                rowKey="userId"
                rowHref={(row) => `/profile/${row.userName}`}
                size="small"
                pagination={false}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

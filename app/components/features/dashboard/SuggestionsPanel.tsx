"use client";

import React, { useCallback, useEffect, useState } from "react";
import { UserMinus, UserPlus } from "lucide-react";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils/format";
import { ModalService } from "@/lib/services/modalService";
import { ToastService } from "@/lib/services/toastService";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { AppUserLabel } from "@/components/ui/AppUserLabel";
import { EMPTY_STATES } from "@/lib/config/emptyStates";
import { useAuth } from "../../../providers/AuthProvider";

interface SuggestionScore {
  user: User;
  score: number;
  reasons: string[];
}

function calculateSuggestionScore(
  user: User,
  currentUser: User | null,
  allPosts: Post[],
): SuggestionScore {
  let score = 0;
  const reasons: string[] = [];

  score += Math.min((user.followers || 0) / 100, 30);

  if (currentUser) {
    if (
      user.location &&
      currentUser.location &&
      user.location.toLowerCase().includes(currentUser.location.toLowerCase())
    ) {
      score += 40;
      reasons.push("Same location");
    } else if (
      user.location &&
      currentUser.location &&
      user.location.split(",")[0].toLowerCase() ===
        currentUser.location.split(",")[0].toLowerCase()
    ) {
      score += 20;
      reasons.push("Nearby location");
    }

    const userPosts = allPosts.filter((p) => p.userId === user.id);
    const currentUserLikes = currentUser.likes ?? [];
    const currentUserBookmarks = currentUser.bookmarks ?? [];

    if (userPosts.some((post) => currentUserLikes.includes(post.id))) {
      score += 15;
      reasons.push("You liked their posts");
    }
    if (userPosts.some((post) => currentUserBookmarks.includes(post.id))) {
      score += 15;
      reasons.push("You bookmarked their posts");
    }

    const currentUserPosts = allPosts.filter(
      (p) => p.userId === currentUser.id,
    );
    const currentUserTags = new Set(currentUserPosts.flatMap((p) => p.tags));
    const userTags = new Set(userPosts.flatMap((p) => p.tags));
    const commonTags = Array.from(currentUserTags).filter((tag) =>
      userTags.has(tag),
    );
    if (commonTags.length > 0) {
      score += Math.min(commonTags.length * 5, 20);
      reasons.push(`${commonTags.length} common interests`);
    }

    const currentUserFollowing = new Set(currentUser.following ?? []);
    const userFollowing = new Set(user.following ?? []);
    const mutualCount = Array.from(currentUserFollowing).filter((id) =>
      userFollowing.has(id),
    ).length;
    if (mutualCount > 0) {
      score += Math.min(mutualCount * 5, 10);
      reasons.push(`${mutualCount} mutual connections`);
    }
  }

  if (user.verified) {
    score += 5;
  }

  return { user, score, reasons };
}

export function SuggestionsPanel(): React.ReactElement {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loadingFollowId, setLoadingFollowId] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResponse, postsResponse] = await Promise.all([
        api.get<User[]>(API_ENDPOINTS.USERS),
        api.get<Post[]>(API_ENDPOINTS.POSTS),
      ]);

      const currentUserFollowing = new Set(currentUser?.following ?? []);
      const candidateUsers = (usersResponse.data || []).filter(
        (user) =>
          user.id !== currentUser?.id && !currentUserFollowing.has(user.id),
      );

      const allPosts = Array.isArray(postsResponse.data)
        ? postsResponse.data
        : postsResponse.data || [];
      const topSuggestions = candidateUsers
        .map((user) => calculateSuggestionScore(user, currentUser, allPosts))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((s) => s.user);

      setSuggestedUsers(topSuggestions);
    } catch {
      // silent — panel is non-critical
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void fetchSuggestions();
  }, [fetchSuggestions]);

  const handleFollow = async (userId: string): Promise<void> => {
    if (!isAuthenticated || !currentUser) {
      const confirmed = await ModalService.confirm({
        title: "Login required",
        description: "You need to be signed in to follow users.",
        confirmLabel: "Sign in",
      });
      if (confirmed) {
        window.location.href = "/login";
      }
      return;
    }

    setLoadingFollowId(userId);
    const alreadyFollowing = followingIds.has(userId);
    try {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (alreadyFollowing) {
          next.delete(userId);
        } else {
          next.add(userId);
        }
        return next;
      });
      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                followers: (u.followers || 0) + (alreadyFollowing ? -1 : 1),
              }
            : u,
        ),
      );
      await api.post(API_ENDPOINTS.USER_FOLLOW(userId), {
        userId: currentUser.id,
      });
    } catch {
      // rollback
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (alreadyFollowing) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                followers: (u.followers || 0) + (alreadyFollowing ? 1 : -1),
              }
            : u,
        ),
      );
      ToastService.error("Failed to update follow status");
    } finally {
      setLoadingFollowId(null);
    }
  };

  return (
    <AppCard variant="default" className="h-fit">
      <h3 className="mb-3 font-semibold text-[var(--color-text-primary)]">
        Suggested for you
      </h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <AppSpinner size={20} />
        </div>
      ) : suggestedUsers.length === 0 ? (
        <AppEmptyState
          title={EMPTY_STATES.noFollowing.title}
          description="No new suggestions right now."
          icon={EMPTY_STATES.noFollowing.icon}
          size="sm"
        />
      ) : (
        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-light)] bg-[var(--color-bg-elevated)]/40 p-3">
              <div className="min-w-0 flex-1">
                <AppUserLabel
                  user={{
                    userName: user.userName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                    verified: user.verified,
                  }}
                  avatarSize={40}
                  showHandle
                  showFullName
                  linkToProfile
                  meta={`${formatNumber(user.followers || 0)} followers`}
                />
              </div>
              <AppButton
                variant={followingIds.has(user.id) ? "secondary" : "primary"}
                size="sm"
                className="!h-8 !rounded-full !px-3"
                icon={followingIds.has(user.id) ? UserMinus : UserPlus}
                loading={loadingFollowId === user.id}
                disabled={
                  loadingFollowId !== null && loadingFollowId !== user.id
                }
                onClick={() => void handleFollow(user.id)}>
                {followingIds.has(user.id) ? "Following" : "Follow"}
              </AppButton>
            </div>
          ))}
        </div>
      )}
    </AppCard>
  );
}

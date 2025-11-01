"use client";

import React, { useState, useEffect } from "react";
import { Card, Avatar, Button, Empty, Spin } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import Link from "next/link";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils/format";
import { useAuth } from "../../../providers/AuthProvider";

interface SuggestionScore {
  user: User;
  score: number;
  reasons: string[];
}

export function SuggestionsPanel() {
  const { user: currentUser } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, [currentUser]);

  const calculateSuggestionScore = (
    user: User,
    currentUser: User | null,
    allPosts: Post[]
  ): SuggestionScore => {
    let score = 0;
    const reasons: string[] = [];

    // Base score from followers (normalized to 0-30)
    const followerScore = Math.min((user.followers || 0) / 100, 30);
    score += followerScore;

    if (currentUser) {
      // Location-based suggestions (40 points)
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

      // Activity-based suggestions (30 points)
      const userPosts = allPosts.filter((p) => p.userId === user.id);
      const currentUserLikes = currentUser.likes || [];
      const currentUserBookmarks = currentUser.bookmarks || [];

      // Check if current user interacted with this user's posts
      const hasLikedUserPosts = userPosts.some((post) =>
        currentUserLikes.includes(post.id)
      );
      const hasBookmarkedUserPosts = userPosts.some((post) =>
        currentUserBookmarks.includes(post.id)
      );

      if (hasLikedUserPosts) {
        score += 15;
        reasons.push("You liked their posts");
      }
      if (hasBookmarkedUserPosts) {
        score += 15;
        reasons.push("You bookmarked their posts");
      }

      // Check for common tags (20 points)
      const currentUserPosts = allPosts.filter(
        (p) => p.userId === currentUser.id
      );
      const currentUserTags = new Set(currentUserPosts.flatMap((p) => p.tags));
      const userTags = new Set(userPosts.flatMap((p) => p.tags));
      const commonTags = Array.from(currentUserTags).filter((tag) =>
        userTags.has(tag)
      );

      if (commonTags.length > 0) {
        score += Math.min(commonTags.length * 5, 20);
        reasons.push(`${commonTags.length} common interests`);
      }

      // Mutual connections (10 points)
      const currentUserFollowing = new Set(currentUser.following || []);
      const userFollowing = new Set(user.following || []);
      const mutualCount = Array.from(currentUserFollowing).filter((id) =>
        userFollowing.has(id)
      ).length;

      if (mutualCount > 0) {
        score += Math.min(mutualCount * 5, 10);
        reasons.push(`${mutualCount} mutual connections`);
      }
    }

    // Verified users get a small boost (5 points)
    if (user.verified) {
      score += 5;
    }

    return { user, score, reasons };
  };

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const [usersResponse, postsResponse] = await Promise.all([
        api.get<User[]>(API_ENDPOINTS.USERS),
        api.get<Post[]>(API_ENDPOINTS.POSTS),
      ]);

      // Filter out current user and already following
      const currentUserFollowing = new Set(currentUser?.following || []);
      const candidateUsers = usersResponse.data.filter(
        (user) =>
          user.id !== currentUser?.id && !currentUserFollowing.has(user.id)
      );

      // Calculate scores for each user
      const scoredUsers = candidateUsers.map((user) =>
        calculateSuggestionScore(user, currentUser, postsResponse.data)
      );

      // Sort by score and take top 5
      const topSuggestions = scoredUsers
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((s) => s.user);

      setSuggestedUsers(topSuggestions);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!currentUser) {
      return;
    }

    try {
      setFollowingIds((prev) => new Set([...prev, userId]));

      // Update user followers count optimistically
      setSuggestedUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, followers: (user.followers || 0) + 1 }
            : user
        )
      );

      // Make API call with userId in body
      await api.post(API_ENDPOINTS.USER_FOLLOW(userId), {
        userId: currentUser.id,
      });
    } catch (error) {
      console.error("Failed to follow user:", error);
      // Rollback on error
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setSuggestedUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, followers: (user.followers || 0) - 1 }
            : user
        )
      );
    }
  };

  if (loading) {
    return (
      <Card className="h-fit">
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={<div className="font-semibold">Suggested for you</div>}
      className="h-fit"
      variant="outlined">
      {suggestedUsers.length === 0 ? (
        <Empty
          description="No suggestions"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="py-4"
        />
      ) : (
        <div className="flex gap-6 flex-row lg:flex-col overflow-x-auto">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex flex-col lg:flex-row gap-2 items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Link href={`/profile/${user.userName}`}>
                  <Avatar
                    size={48}
                    src={user.avatar}
                    className="cursor-pointer hover:opacity-80 shrink-0">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${user.userName}`}>
                    <div className="font-semibold text-gray-900 hover:text-[#00623B] cursor-pointer truncate">
                      {user.firstName} {user.lastName}
                    </div>
                  </Link>
                  <div className="text-sm text-gray-500 truncate">
                    @{user.userName}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatNumber(user.followers || 0)} followers
                  </div>
                </div>
              </div>
              <Button
                type={followingIds.has(user.id) ? "default" : "primary"}
                size="small"
                icon={!followingIds.has(user.id) && <UserAddOutlined />}
                onClick={() => handleFollow(user.id)}
                disabled={followingIds.has(user.id)}
                className={
                  followingIds.has(user.id)
                    ? ""
                    : "bg-[#00623B] hover:bg-[#004d2e]"
                }>
                {followingIds.has(user.id) ? "Following" : "Follow"}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="link" block className="mt-4 text-[#00623B]">
        See all suggestions
      </Button>
    </Card>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Card, Avatar, Button, Empty, Spin } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import Link from "next/link";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils/format";

export function SuggestionsPanel() {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await api.get<User[]>(API_ENDPOINTS.USERS);
      // Get top 5 users by followers (excluding current user)
      const suggestions = response.data
        .filter((user) => user.id !== "1") // Exclude current user
        .sort((a, b) => (b.followers || 0) - (a.followers || 0))
        .slice(0, 5);

      setSuggestedUsers(suggestions);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      // Mock follow - replace with actual API call
      setFollowingIds((prev) => new Set([...prev, userId]));

      // Update user followers count optimistically
      setSuggestedUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, followers: (user.followers || 0) + 1 }
            : user
        )
      );
    } catch (error) {
      console.error("Failed to follow user:", error);
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
      variant="outlined"
    >
      {suggestedUsers.length === 0 ? (
        <Empty
          description="No suggestions"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="py-4"
        />
      ) : (
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Link href={`/profile/${user.userName}`}>
                  <Avatar
                    size={48}
                    src={user.avatar}
                    className="cursor-pointer hover:opacity-80 shrink-0"
                  >
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
                }
              >
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

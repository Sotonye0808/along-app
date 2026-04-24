"use client";

import React from "react";
import Link from "next/link";
import { Avatar } from "antd";
import { CheckCircle } from "lucide-react";
import type { AvatarConfig } from "@/lib/config";
import { getFallbackAvatarUrl } from "@/lib/config";

export interface AvatarUser {
  userName: string;
  firstName: string;
  avatar?: string;
  avatarConfig?: AvatarConfig | null;
  verified?: boolean;
}

export interface AppAvatarProps {
  user: AvatarUser;
  size?: 24 | 32 | 40 | 56 | 80 | 120;
  linkToProfile?: boolean;
  showVerifiedBadge?: boolean;
  className?: string;
}

export function AppAvatar({
  user,
  size = 40,
  linkToProfile = true,
  showVerifiedBadge = true,
  className,
}: AppAvatarProps): React.ReactElement {
  const src =
    user.avatar ||
    getFallbackAvatarUrl(user.userName || user.firstName || "along-user");

  const avatarNode = (
    <span
      className={["relative inline-flex", className ?? ""].join(" ").trim()}>
      <Avatar size={size} src={src}>
        {user.firstName?.slice(0, 1).toUpperCase()}
      </Avatar>
      {showVerifiedBadge && user.verified ? (
        <span
          className="absolute -right-0.5 -bottom-0.5 rounded-full bg-white p-0.5 text-[var(--color-primary)]"
          aria-label="Verified user">
          <CheckCircle size={Math.max(10, Math.round(size * 0.28))} />
        </span>
      ) : null}
    </span>
  );

  if (!linkToProfile) {
    return avatarNode;
  }

  return (
    <Link
      href={`/profile/${user.userName}`}
      onClick={(event) => event.stopPropagation()}
      aria-label={`View ${user.firstName} profile`}>
      {avatarNode}
    </Link>
  );
}

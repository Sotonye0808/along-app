"use client";

import React from "react";
import Link from "next/link";
import type { AvatarConfig } from "@/lib/config/avatar";
import { AppAvatar } from "./AppAvatar";

export interface UserLabelUser {
  userName: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  avatarConfig?: AvatarConfig | null;
  verified?: boolean;
}

export interface AppUserLabelProps {
  user: UserLabelUser;
  avatarSize?: 24 | 32 | 40;
  showHandle?: boolean;
  showFullName?: boolean;
  meta?: React.ReactNode;
  layout?: "horizontal" | "vertical";
  linkToProfile?: boolean;
  className?: string;
}

export function AppUserLabel({
  user,
  avatarSize = 32,
  showHandle = true,
  showFullName = true,
  meta,
  layout = "horizontal",
  linkToProfile = true,
  className,
}: AppUserLabelProps): React.ReactElement {
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div
      className={[
        "inline-flex items-center gap-2",
        layout === "vertical" ? "flex-col items-start" : "flex-row",
        className ?? "",
      ]
        .join(" ")
        .trim()}>
      <AppAvatar user={user} size={avatarSize} linkToProfile={linkToProfile} />
      <div className="min-w-0">
        {showFullName ? (
          linkToProfile ? (
            <Link
              href={`/profile/${user.userName}`}
              className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] hover:underline"
              onClick={(event) => event.stopPropagation()}>
              {fullName}
            </Link>
          ) : (
            <span className="font-medium text-[var(--color-text-primary)]">
              {fullName}
            </span>
          )
        ) : null}
        {showHandle ? (
          <div className="text-xs text-[var(--color-text-secondary)]">
            @{user.userName}
          </div>
        ) : null}
        {meta ? (
          <div className="text-xs text-[var(--color-text-muted)]">{meta}</div>
        ) : null}
      </div>
    </div>
  );
}

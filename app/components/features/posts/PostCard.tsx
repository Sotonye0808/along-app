"use client";

import React, { memo, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  DollarSign,
  Ellipsis,
  ExternalLink,
  MapPin,
  MessageCircle,
  Share2,
  ThumbsDown,
  ThumbsUp,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { ROUTE_STATUS_REGISTRY } from "@/lib/config/routeStatus";
import { VEHICLE_REGISTRY } from "@/lib/config/vehicles";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppDropdown } from "@/components/ui/AppDropdown";
import { AppModal } from "@/components/ui/AppModal";
import { AppTag } from "@/components/ui/AppTag";
import { AppTooltip } from "@/components/ui/AppTooltip";
import { AppUserLabel } from "@/components/ui/AppUserLabel";
import { TrustBadge } from "@/components/ui/TrustBadge";

interface PostCardProps {
  post: Post;
  author: User;
  currentUserId?: string;
  onLike?: (postId: string) => void | Promise<void>;
  onDislike?: (postId: string) => void | Promise<void>;
  onComment?: (postId: string) => void;
  onBookmark?: (postId: string) => void | Promise<void>;
  onShare?: (postId: string) => void | Promise<void>;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onFollow?: (userId: string) => void | Promise<void>;
  isLiked?: boolean;
  isDisliked?: boolean;
  isBookmarked?: boolean;
  isFollowing?: boolean;
}

type ActionName = "like" | "dislike" | "bookmark" | "share" | "follow";

export const PostCard = memo(function PostCard({
  post,
  author,
  currentUserId,
  onLike,
  onDislike,
  onComment,
  onBookmark,
  onShare,
  onEdit,
  onDelete,
  onFollow,
  isLiked = false,
  isDisliked = false,
  isBookmarked = false,
  isFollowing = false,
}: PostCardProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<ActionName | null>(null);

  const isOwnPost = currentUserId === post.userId;
  const validityScore = typeof post.validityScore === "number" ? post.validityScore : null;

  const menuItems = useMemo(() => {
    const items = [] as {
      key: string;
      label: React.ReactNode;
      danger?: boolean;
      onClick?: () => void;
    }[];

    if (isOwnPost) {
      items.push(
        {
          key: "edit",
          label: "Edit post",
          onClick: () => onEdit?.(post),
        },
        {
          key: "delete",
          label: "Delete post",
          danger: true,
          onClick: () => onDelete?.(post.id),
        },
      );
    }

    items.push(
      {
        key: "report",
        label: "Report post",
      },
      {
        key: "hide",
        label: "Hide this post",
      },
    );

    if (!isOwnPost) {
      items.push({
        key: "follow",
        label: isFollowing
          ? `Unfollow @${author.userName}`
          : `Follow @${author.userName}`,
        onClick: () => {
          void handleAction("follow", () => onFollow?.(author.id));
        },
      });
    }

    return items;
  }, [
    isOwnPost,
    isFollowing,
    author.userName,
    author.id,
    onEdit,
    post,
    onDelete,
    onFollow,
  ]);

  async function handleAction(
    action: ActionName,
    callback: (() => void | Promise<void>) | undefined,
  ): Promise<void> {
    if (!callback) {
      return;
    }

    setLoadingAction(action);
    try {
      await callback();
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <AppCard variant="default" hover className="mb-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <AppUserLabel
            user={{
              userName: author.userName,
              firstName: author.firstName,
              lastName: author.lastName,
              avatar: author.avatar,
              verified: author.verified,
            }}
            avatarSize={40}
          />
          <div className="text-xs text-[var(--color-text-secondary)]">
            {formatDate(post.createdAt)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isOwnPost && onFollow ? (
            <AppButton
              variant={isFollowing ? "secondary" : "primary"}
              size="sm"
              icon={isFollowing ? UserMinus : UserPlus}
              loading={loadingAction === "follow"}
              disabled={loadingAction !== null && loadingAction !== "follow"}
              onClick={() => {
                void handleAction("follow", () => onFollow(author.id));
              }}>
              {isFollowing ? "Following" : "Follow"}
            </AppButton>
          ) : null}

          <AppDropdown
            items={menuItems}
            placement="bottomRight"
            trigger={["click"]}>
            <AppButton
              variant="icon"
              icon={Ellipsis}
              ariaLabel="More options"
            />
          </AppDropdown>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
        <Link
          href={`/posts/${post.id}`}
          className="hover:underline"
          onClick={(e) => e.stopPropagation()}>
          {post.title}
        </Link>
      </h2>

      {validityScore !== null ? (
        <div className="mb-3">
          <TrustBadge score={validityScore} size="small" />
        </div>
      ) : null}

      <div className="mb-4 space-y-3">
        {post.routes.map((route, index) => {
          const statusConfig = ROUTE_STATUS_REGISTRY[route.status];
          const StatusIcon = statusConfig.icon;

          return (
            <div key={route.id} className="flex gap-3">
              <div className="flex w-8 flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
                  {index + 1}
                </div>
                {index < post.routes.length - 1 ? (
                  <div className="mt-1 h-full w-0.5 flex-1 bg-[var(--color-border)]" />
                ) : null}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {route.text}
                  </p>
                  <AppTooltip title={statusConfig.description}>
                    <span
                      className="inline-flex items-center gap-1 text-xs"
                      style={{ color: statusConfig.colorToken }}>
                      <StatusIcon size={14} aria-hidden="true" />
                      {statusConfig.label}
                    </span>
                  </AppTooltip>
                </div>

                {route.vehicles.length > 0 || route.fare ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {route.vehicles.map((vehicleKey) => {
                      const config = VEHICLE_REGISTRY[vehicleKey];
                      return (
                        <AppTag
                          key={`${route.id}-${vehicleKey}`}
                          label={config.label}
                          icon={config.icon}
                          size="sm"
                          variant="default"
                        />
                      );
                    })}
                    {route.fare ? (
                      <AppTag
                        label={`N${formatNumber(route.fare)}`}
                        icon={DollarSign}
                        size="sm"
                        variant="success"
                      />
                    ) : null}
                  </div>
                ) : null}

                {route.links.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {route.links.map((link) => (
                      <a
                        key={`${route.id}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline">
                        <MapPin size={14} aria-hidden="true" />
                        {link.text}
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {post.images.length > 0 ? (
        <div
          className={`mb-4 grid gap-2 ${
            post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}>
          {post.images.slice(0, 4).map((image, index) => (
            <button
              key={`${post.id}-image-${index}`}
              type="button"
              className="relative aspect-video overflow-hidden rounded-lg"
              onClick={() => setPreviewImage(image)}>
              <Image
                src={image}
                alt={`${post.title} image ${index + 1}`}
                width={1200}
                height={675}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="h-full w-full object-cover"
              />
              {index === 3 && post.images.length > 4 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                  +{post.images.length - 4}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {(post.tags.length > 0 || post.region) ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {post.region ? (
            <Link
              key={`${post.id}-region`}
              href={`/explore?region=${encodeURIComponent(post.region)}`}
              onClick={(e) => e.stopPropagation()}>
              <AppTag label={post.region} size="sm" variant="info" icon={MapPin} />
            </Link>
          ) : null}
          {post.tags.map((tag) => (
            <Link
              key={`${post.id}-${tag}`}
              href={`/explore?tag=${encodeURIComponent(tag)}`}
              onClick={(e) => e.stopPropagation()}>
              <AppTag label={`#${tag}`} size="sm" variant="primary" />
            </Link>
          ))}
        </div>
      ) : null}

      <div className="border-t border-[var(--color-border)] pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <AppButton
              variant="ghost"
              icon={ThumbsUp}
              size="sm"
              className={isLiked ? "!text-[var(--color-primary)]" : ""}
              loading={loadingAction === "like"}
              disabled={loadingAction !== null && loadingAction !== "like"}
              onClick={() => {
                void handleAction("like", () => onLike?.(post.id));
              }}
              ariaLabel="Like post">
              {formatNumber(post.likes)}
            </AppButton>

            <AppButton
              variant="ghost"
              icon={ThumbsDown}
              size="sm"
              className={isDisliked ? "!text-[var(--color-error-text)]" : ""}
              loading={loadingAction === "dislike"}
              disabled={loadingAction !== null && loadingAction !== "dislike"}
              onClick={() => {
                void handleAction("dislike", () => onDislike?.(post.id));
              }}
              ariaLabel="Dislike post">
              {formatNumber(post.dislikes)}
            </AppButton>

            <AppButton
              variant="ghost"
              icon={MessageCircle}
              size="sm"
              disabled={loadingAction !== null}
              onClick={() => onComment?.(post.id)}
              ariaLabel="View comments">
              {formatNumber(post.comments)}
            </AppButton>
          </div>

          <div className="flex items-center gap-1">
            <AppButton
              variant="ghost"
              icon={isBookmarked ? BookmarkCheck : Bookmark}
              size="sm"
              loading={loadingAction === "bookmark"}
              disabled={loadingAction !== null && loadingAction !== "bookmark"}
              onClick={() => {
                void handleAction("bookmark", () => onBookmark?.(post.id));
              }}
              ariaLabel="Bookmark post"
            />
            <AppButton
              variant="ghost"
              icon={Share2}
              size="sm"
              loading={loadingAction === "share"}
              disabled={loadingAction !== null && loadingAction !== "share"}
              onClick={() => {
                void handleAction("share", () => onShare?.(post.id));
              }}
              ariaLabel="Share post"
            />
          </div>
        </div>
      </div>

      <AppModal
        open={previewImage !== null}
        onClose={() => setPreviewImage(null)}
        title={post.title}
        size="lg"
        footer={null}>
        {previewImage ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={previewImage}
              alt={post.title}
              width={1200}
              height={675}
              sizes="100vw"
              className="h-full w-full object-contain"
            />
          </div>
        ) : null}
      </AppModal>
    </AppCard>
  );
});

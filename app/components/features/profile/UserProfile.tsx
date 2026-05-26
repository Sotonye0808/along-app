"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  CheckCircle,
  Edit,
  Link as LinkIcon,
  MapPin,
  Route,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/features/posts/PostCard";
import { CommentSection } from "@/components/features/posts/CommentSection";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { APP_ROUTES } from "@/lib/constants";
import { ModalService } from "@/lib/services/modalService";
import { ToastService } from "@/lib/services/toastService";
import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppTag } from "@/components/ui/AppTag";
import { EMPTY_STATES } from "@/lib/config/emptyStates";
import {
  useProfileComments,
  useProfileSharing,
} from "@/lib/hooks/useProfileInteractions";

interface UserProfileProps {
  user: User;
  isOwnProfile: boolean;
  posts: (Post & { author: User })[];
  comments: (PostComment & { author: User; post: Post })[];
  currentUserId?: string;
  isAuthenticated?: boolean;
  onEditProfile?: () => void;
  onFollow?: (userId: string) => void;
  isFollowing?: boolean;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onLikeComment?: (commentId: string, postId: string) => void;
  onDislikeComment?: (commentId: string, postId: string) => void;
  onEditComment?: (commentId: string, newText: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  userInteractions?: {
    likes: Set<string>;
    dislikes: Set<string>;
    bookmarks: Set<string>;
  };
}

type ProfileTab = "posts" | "liked" | "bookmarks" | "routes";

export function UserProfile({
  user,
  isOwnProfile,
  posts,
  comments,
  currentUserId,
  isAuthenticated = false,
  onEditProfile,
  onFollow,
  isFollowing = false,
  onLike,
  onDislike,
  onComment,
  onBookmark,
  onShare,
  onEdit,
  onDelete,
  onLikeComment: onLikeCommentProp,
  onDislikeComment: onDislikeCommentProp,
  onEditComment: onEditCommentProp,
  onDeleteComment: onDeleteCommentProp,
  userInteractions = {
    likes: new Set(),
    dislikes: new Set(),
    bookmarks: new Set(),
  },
}: UserProfileProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const router = useRouter();

  const {
    commentModalOpen,
    selectedComment,
    openCommentModal,
    closeCommentModal,
    likeComment: hookLikeComment,
    dislikeComment: hookDislikeComment,
    editComment: hookEditComment,
    deleteComment: hookDeleteComment,
  } = useProfileComments(currentUserId);

  const { shareProfile } = useProfileSharing();

  const handleLikeComment = onLikeCommentProp ?? hookLikeComment;
  const handleDislikeComment = onDislikeCommentProp ?? hookDislikeComment;
  const handleEditComment = onEditCommentProp ?? hookEditComment;
  const handleDeleteComment = onDeleteCommentProp ?? hookDeleteComment;

  const handleFollowClick = async () => {
    if (!isAuthenticated) {
      const confirmed = await ModalService.confirm({
        title: "Login required",
        description: "You need to be signed in to follow users.",
        confirmLabel: "Sign in",
      });
      if (confirmed) {
        router.push(APP_ROUTES.LOGIN);
      }
      return;
    }
    onFollow?.(user.id);
  };

  const handleCopyProfileLink = () => {
    shareProfile(user);
    ToastService.success("Profile link copied");
  };

  const tabs: { key: ProfileTab; label: string; count: number }[] = [
    { key: "posts", label: "Posts", count: posts.length },
    { key: "liked", label: "Liked", count: 0 },
    ...(isOwnProfile ? [{ key: "bookmarks" as const, label: "Bookmarks", count: 0 }] : []),
    { key: "routes", label: "Routes", count: posts.filter((p) => p.routes?.length > 0).length },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Profile Header with Cover */}
      <div className="relative mb-16">
        {/* Cover Image */}
        <div className="h-48 w-full rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden">
          {user.coverImage && (
            <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Avatar - overlapping cover */}
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <AppAvatar user={user} size={96} linkToProfile={false} showVerifiedBadge />
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[var(--color-bg-card)] rounded-full p-0.5">
              <Route size={20} className="text-[var(--color-primary)]" />
            </div>
          </div>
        </div>

        {/* Edit Cover Button (own profile) */}
        {isOwnProfile && (
          <button className="absolute top-3 right-3 px-3 py-1.5 bg-black/50 text-white text-sm rounded-lg hover:bg-black/70 transition-colors flex items-center gap-1.5">
            <Edit size={14} />
            Edit Cover
          </button>
        )}
      </div>

      {/* Profile Info Card */}
      <AppCard variant="default" className="mb-6 -mt-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="pl-24 md:pl-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {user.firstName} {user.lastName}
              </h1>
              {user.verified ? (
                <CheckCircle
                  size={18}
                  className="shrink-0 text-[var(--color-primary)]"
                  aria-label="Verified"
                />
              ) : null}
            </div>
            <p className="text-[var(--color-text-secondary)] mb-3">
              @{user.userName}
            </p>

            {user.bio ? (
              <p className="mb-4 whitespace-pre-wrap text-[var(--color-text-primary)] max-w-lg">
                {user.bio}
              </p>
            ) : null}

            {/* Stats Row */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">{posts.length}</div>
                <div className="text-xs text-[var(--color-text-muted)]">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">{formatNumber(user.followers ?? 0)}</div>
                <div className="text-xs text-[var(--color-text-muted)]">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">{user.following?.length ?? 0}</div>
                <div className="text-xs text-[var(--color-text-muted)]">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">{formatNumber((user as any).routes ?? 0)}</div>
                <div className="text-xs text-[var(--color-text-muted)]">Routes</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Reward Tier Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-full">
              <Award size={16} className="text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Explorer</span>
            </div>

            {isOwnProfile ? (
              <AppButton icon={Edit} onClick={onEditProfile}>
                Edit Profile
              </AppButton>
            ) : (
              <AppButton
                variant={isFollowing ? "secondary" : "primary"}
                icon={isFollowing ? UserMinus : UserPlus}
                onClick={() => void handleFollowClick()}>
                {isFollowing ? "Following" : "Follow"}
              </AppButton>
            )}
            <AppButton
              variant="secondary"
              icon={LinkIcon}
              onClick={handleCopyProfileLink}
              ariaLabel="Share profile">
              Share
            </AppButton>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)] mt-4 pl-24 md:pl-0">
          {user.location ? (
            <div className="flex items-center gap-2">
              <MapPin size={14} aria-hidden="true" />
              <span>{user.location}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <Calendar size={14} aria-hidden="true" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </AppCard>

      {/* Tabs */}
      <div className="mb-4 flex border-b border-[var(--color-border)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={[
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            ]
              .join(" ")
              .trim()}
            onClick={() => setActiveTab(tab.key)}>
            {tab.label}
            {tab.count > 0 ? (
              <span className="text-xs text-[var(--color-text-muted)]">({tab.count})</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "posts" ? (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <AppEmptyState
              title={EMPTY_STATES.noPosts.title}
              description={
                isOwnProfile
                  ? "You haven't shared any routes yet."
                  : `${user.firstName} hasn't shared any routes yet.`
              }
              icon={EMPTY_STATES.noPosts.icon}
            />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={post.author}
                currentUserId={currentUserId}
                onLike={onLike}
                onDislike={onDislike}
                onComment={onComment}
                onBookmark={onBookmark}
                onShare={onShare}
                onEdit={onEdit}
                onDelete={onDelete}
                isLiked={userInteractions.likes.has(post.id)}
                isDisliked={userInteractions.dislikes.has(post.id)}
                isBookmarked={userInteractions.bookmarks.has(post.id)}
              />
            ))
          )}
        </div>
      ) : activeTab === "routes" ? (
        <div className="space-y-4">
          {posts.filter((p) => p.routes?.length > 0).length === 0 ? (
            <AppEmptyState
              title="No routes yet"
              description="Routes with map data will appear here."
              icon={EMPTY_STATES.noPosts.icon}
            />
          ) : (
            posts.filter((p) => p.routes?.length > 0).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={post.author}
                currentUserId={currentUserId}
                onLike={onLike}
                onDislike={onDislike}
                onComment={onComment}
                onBookmark={onBookmark}
                onShare={onShare}
                onEdit={onEdit}
                onDelete={onDelete}
                isLiked={userInteractions.likes.has(post.id)}
                isDisliked={userInteractions.dislikes.has(post.id)}
                isBookmarked={userInteractions.bookmarks.has(post.id)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-16">
          <AppEmptyState
            title="Coming soon"
            description="This tab will show your liked and bookmarked content."
            icon={EMPTY_STATES.noPosts.icon}
          />
        </div>
      )}

      {selectedComment ? (
        <CommentSection
          open={commentModalOpen}
          onClose={closeCommentModal}
          postId={selectedComment.postId}
          comments={comments.filter((c) => c.postId === selectedComment.postId)}
          currentUser={currentUserId ? ({ id: currentUserId } as User) : null}
          onAddComment={async () => {}}
          onLikeComment={(commentId) =>
            handleLikeComment(commentId, selectedComment.postId)
          }
          onDislikeComment={(commentId) =>
            handleDislikeComment(commentId, selectedComment.postId)
          }
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          onShowLoginModal={async () => {
            router.push(APP_ROUTES.LOGIN);
          }}
        />
      ) : null}
    </div>
  );
}

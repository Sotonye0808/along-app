"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  Edit,
  Link as LinkIcon,
  MapPin,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/features/posts/PostCard";
import { CommentSection } from "@/components/features/posts/CommentSection";
import { formatDate } from "@/lib/utils/format";
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

type ProfileTab = "posts" | "comments";

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

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "posts", label: `Posts (${posts.length})` },
    { key: "comments", label: `Comments (${comments.length})` },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Profile Header */}
      <AppCard variant="default" className="mb-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex justify-center md:justify-start">
            <AppAvatar user={user} size={120} linkToProfile={false} showVerifiedBadge />
          </div>

          <div className="flex-1">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
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
                <p className="text-[var(--color-text-secondary)]">
                  @{user.userName}
                </p>
              </div>

              <div className="flex gap-2">
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

            {user.bio ? (
              <p className="mb-4 whitespace-pre-wrap text-[var(--color-text-primary)]">
                {user.bio}
              </p>
            ) : null}

            <div className="mb-4 flex gap-6">
              <div>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {posts.length}
                </span>
                <span className="ml-1 text-[var(--color-text-secondary)]">
                  Posts
                </span>
              </div>
              <div>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {user.followers ?? 0}
                </span>
                <span className="ml-1 text-[var(--color-text-secondary)]">
                  Followers
                </span>
              </div>
              <div>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {user.following?.length ?? 0}
                </span>
                <span className="ml-1 text-[var(--color-text-secondary)]">
                  Following
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
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
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            ]
              .join(" ")
              .trim()}
            onClick={() => setActiveTab(tab.key)}>
            {tab.label}
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
      ) : (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <AppEmptyState
              title="No comments yet"
              description={
                isOwnProfile
                  ? "You haven't commented on any posts yet."
                  : `${user.firstName} hasn't commented on any posts yet.`
              }
              icon={EMPTY_STATES.noPosts.icon}
            />
          ) : (
            comments.map((comment) => (
              <AppCard key={comment.id} variant="default" hover>
                <div className="flex flex-col gap-3">
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    Commented on{" "}
                    <Link
                      href={`/posts/${comment.post.id}`}
                      className="font-semibold text-[var(--color-text-primary)] hover:underline"
                      onClick={(e) => e.stopPropagation()}>
                      {comment.post.title}
                    </Link>
                  </div>
                  <p className="text-[var(--color-text-primary)]">
                    {comment.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {formatDate(comment.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      {comment.likes > 0 ? (
                        <AppTag
                          label={String(comment.likes)}
                          size="xs"
                          variant="success"
                        />
                      ) : null}
                      <Link
                        href={`/posts/${comment.postId}`}
                        className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                        View Thread
                      </Link>
                    </div>
                  </div>
                </div>
              </AppCard>
            ))
          )}
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

"use client";

import React, { useState } from "react";
import { Avatar, Button, Tabs, Empty, Card, App } from "antd";
import {
  EditOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostCard } from "@/components/features/posts/PostCard";
import { CommentSection } from "@/components/features/posts/CommentSection";
import { formatDate } from "@/lib/utils/format";
import { APP_ROUTES } from "@/lib/constants";

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
  onLikeComment?: (commentId: string) => void;
  onDislikeComment?: (commentId: string) => void;
  onEditComment?: (commentId: string, newText: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  userInteractions?: {
    likes: Set<string>;
    dislikes: Set<string>;
    bookmarks: Set<string>;
  };
}

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
  onLikeComment,
  onDislikeComment,
  onEditComment,
  onDeleteComment,
  userInteractions = {
    likes: new Set(),
    dislikes: new Set(),
    bookmarks: new Set(),
  },
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<
    (PostComment & { author: User; post: Post }) | null
  >(null);
  const { message, modal } = App.useApp();
  const router = useRouter();

  const handleFollowClick = () => {
    if (!isAuthenticated) {
      modal.confirm({
        title: "Login Required",
        content:
          "You need to be logged in to follow users. Would you like to login now?",
        okText: "Login",
        cancelText: "Cancel",
        onOk: () => {
          router.push(APP_ROUTES.LOGIN);
        },
      });
      return;
    }
    onFollow?.(user.id);
  };

  const handleCopyProfileLink = () => {
    const profileUrl = `${window.location.origin}/profile/${user.userName}`;

    if (navigator.share) {
      navigator
        .share({
          title: `${user.firstName} ${user.lastName} on Along`,
          text: `Check out ${user.firstName}'s profile on Along!`,
          url: profileUrl,
        })
        .catch((error) => {
          // User cancelled or share failed
          if (error.name !== "AbortError") {
            navigator.clipboard.writeText(profileUrl);
            message.success("Profile link copied to clipboard!");
          }
        });
    } else {
      navigator.clipboard.writeText(profileUrl);
      message.success("Profile link copied to clipboard!");
    }
  };

  const tabItems = [
    {
      key: "posts",
      label: `Posts (${posts.length})`,
      children: (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Empty
              description={
                isOwnProfile
                  ? "You haven't shared any routes yet"
                  : `${user.firstName} hasn't shared any routes yet`
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
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
      ),
    },
    {
      key: "comments",
      label: `Comments (${comments.length})`,
      children: (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <Empty
              description={
                isOwnProfile
                  ? "You haven't commented on any posts yet"
                  : `${user.firstName} hasn't commented on any posts yet`
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            comments.map((comment) => (
              <Card
                key={comment.id}
                className="mb-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-3">
                  <div className="text-sm text-gray-500">
                    Commented on{" "}
                    <Link
                      href={`/posts/${comment.post.id}`}
                      className="font-semibold text-gray-900 hover:text-[#00623B] cursor-pointer">
                      {comment.post.title}
                    </Link>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="text"
                        size="small"
                        icon={
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                        }
                        onClick={() => onLikeComment?.(comment.id)}
                        className="text-gray-600 hover:text-[#00623B]">
                        {comment.likes > 0 && comment.likes}
                      </Button>
                      <Button
                        type="text"
                        size="small"
                        icon={
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                        }
                        onClick={() => onDislikeComment?.(comment.id)}
                        className="text-gray-600 hover:text-red-500">
                        {comment.dislikes > 0 && comment.dislikes}
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          setSelectedComment(comment);
                          setCommentModalOpen(true);
                        }}
                        className="text-[#00623B]">
                        View Thread
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            <Avatar
              size={120}
              src={user.avatar}
              className="border-4 border-[#00623B]">
              {user.firstName[0]}
              {user.lastName[0]}
            </Avatar>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-500">@{user.userName}</p>
                {user.verified && (
                  <span className="inline-flex items-center gap-1 text-sm text-[#00623B] font-medium mt-1">
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={onEditProfile}
                    className="bg-[#00623B] hover:bg-[#004d2e]">
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    type={isFollowing ? "default" : "primary"}
                    onClick={handleFollowClick}
                    className={
                      isFollowing
                        ? "border-[#00623B] text-[#00623B] hover:bg-gray-50"
                        : "bg-[#00623B] hover:bg-[#004d2e]"
                    }>
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
                <Button icon={<LinkOutlined />} onClick={handleCopyProfileLink}>
                  Share Profile
                </Button>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {user.bio}
              </p>
            )}

            {/* User Stats */}
            <div className="flex gap-6 mb-4">
              <div>
                <span className="font-bold text-gray-900">{posts.length}</span>
                <span className="text-gray-500 ml-1">Posts</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">
                  {user.followers || 0}
                </span>
                <span className="text-gray-500 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">
                  {user.following?.length || 0}
                </span>
                <span className="text-gray-500 ml-1">Following</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {isOwnProfile && user.location && (
                <div className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-gray-400" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-gray-400" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs for Posts and Comments */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="profile-tabs"
      />

      {/* Comment Section Modal */}
      {selectedComment && (
        <CommentSection
          open={commentModalOpen}
          onClose={() => {
            setCommentModalOpen(false);
            setSelectedComment(null);
          }}
          postId={selectedComment.postId}
          comments={comments.filter((c) => c.postId === selectedComment.postId)}
          currentUser={currentUserId ? ({ id: currentUserId } as User) : null}
          onAddComment={async () => {}}
          onLikeComment={onLikeComment}
          onDislikeComment={onDislikeComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          onShowLoginModal={() => {
            // Guest users shouldn't reach here in profile page context,
            // but adding for completeness
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }}
        />
      )}
    </div>
  );
}

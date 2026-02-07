"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Empty, Spin, Button, App, Skeleton, Card } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/features/posts/PostCard";
import { CommentSection } from "@/components/features/posts/CommentSection";
const ShareRouteModal = lazy(() =>
  import("@/components/features/posts/ShareRouteModal").then((mod) => ({
    default: mod.ShareRouteModal,
  }))
);
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS, APP_ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/utils/feedHelpers";
import { useFeedPosts } from "@/lib/hooks/useFeedPosts";
import { useFeedInteractions } from "@/lib/hooks/useFeedInteractions";
import { useComments } from "@/lib/hooks/useComments";
import { useNewPostsNotification } from "@/lib/hooks/useNewPostsNotification";

export function Feed() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const { message, modal } = App.useApp();
  const router = useRouter();

  const currentUser = getCurrentUser();

  // Custom hooks for modular state management
  const {
    posts,
    loading,
    fetchPosts,
    checkForNewPosts,
    updatePostLikes,
    updatePostDislikes,
    updatePostComments,
    updatePostBookmarks,
    updateAuthorFollowers,
    deletePost: removePost,
    updatePost,
  } = useFeedPosts();

  const {
    userInteractions,
    handleLike,
    handleDislike,
    handleBookmark,
    handleFollow,
  } = useFeedInteractions(currentUser);

  const {
    commentModalOpen,
    selectedPostId,
    comments,
    openCommentModal,
    closeCommentModal,
    addComment,
    editComment,
    deleteComment,
    likeComment,
    dislikeComment,
  } = useComments(currentUser);

  const { hasNewPosts, handleLoadNewPosts } = useNewPostsNotification(
    posts,
    checkForNewPosts
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/posts/${postId}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Check out this route",
          url: shareUrl,
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Share failed:", error);
          }
        });
    } else {
      navigator.clipboard.writeText(shareUrl);
      message.success("Link copied to clipboard");
    }
  };

  const handleEdit = (post: Post) => {
    setPostToEdit(post);
    setEditModalOpen(true);
  };

  const handleDelete = (postId: string) => {
    const { notification } = App.useApp();
    const key = `delete-post-${postId}`;
    let undoClicked = false;
    let countdown = 10;

    const updateNotification = () => {
      notification.open({
        key,
        message: "Post deleted",
        description: `Undo within ${countdown} second${
          countdown !== 1 ? "s" : ""
        }`,
        duration: null,
        btn: (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              undoClicked = true;
              notification.destroy(key);
              clearInterval(interval);
              message.info("Deletion cancelled");
            }}>
            Undo
          </Button>
        ),
      });
    };

    updateNotification();

    const interval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        updateNotification();
      } else {
        clearInterval(interval);
        notification.destroy(key);
        if (!undoClicked) {
          api
            .delete(`${API_ENDPOINTS.POSTS}/${postId}`)
            .then(() => {
              removePost(postId);
              message.success("Post deleted permanently");
            })
            .catch((error) => {
              console.error("Failed to delete post:", error);
              message.error("Failed to delete post");
            });
        }
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <Card key={n} className="mb-4">
            <Skeleton active avatar paragraph={{ rows: 4 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Empty
          description="No posts yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchPosts}
          className="mt-4 bg-[#00623B]">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* New Posts Notification Banner */}
      {hasNewPosts && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-slideDown">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => handleLoadNewPosts(fetchPosts)}
            size="large"
            className="bg-[#00623B] dark:bg-[#00a862] shadow-lg">
            Load New Posts
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {(posts || []).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            author={post.author}
            currentUserId={currentUser?.id}
            onLike={(postId) =>
              handleLike(
                postId,
                updatePostLikes,
                updatePostDislikes,
                fetchPosts
              )
            }
            onDislike={(postId) =>
              handleDislike(
                postId,
                updatePostLikes,
                updatePostDislikes,
                fetchPosts
              )
            }
            onComment={openCommentModal}
            onBookmark={(postId) =>
              handleBookmark(postId, updatePostBookmarks, fetchPosts)
            }
            onShare={handleShare}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onFollow={(userId) =>
              handleFollow(userId, updateAuthorFollowers, fetchPosts)
            }
            isLiked={userInteractions.likes.has(post.id)}
            isDisliked={userInteractions.dislikes.has(post.id)}
            isBookmarked={userInteractions.bookmarks.has(post.id)}
            isFollowing={userInteractions.following.has(post.userId)}
          />
        ))}
      </div>

      {/* Edit Post Modal */}
      {postToEdit && (
        <Suspense fallback={<Spin size="large" />}>
          <ShareRouteModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setPostToEdit(null);
            }}
            onSubmit={(postData) => updatePost(postData.id!, postData)}
            editMode={true}
            postToEdit={postToEdit}
          />
        </Suspense>
      )}

      {/* Comment Section Modal */}
      {selectedPostId && (
        <CommentSection
          open={commentModalOpen}
          onClose={closeCommentModal}
          postId={selectedPostId}
          comments={comments}
          currentUser={currentUser}
          onAddComment={(postId, text) =>
            addComment(postId, text, updatePostComments)
          }
          onLikeComment={likeComment}
          onDislikeComment={dislikeComment}
          onEditComment={editComment}
          onDeleteComment={(commentId) =>
            deleteComment(commentId, updatePostComments)
          }
          onShowLoginModal={() => {
            modal.confirm({
              title: "Login Required",
              content:
                "You need to be logged in to interact with comments. Would you like to login now?",
              okText: "Login",
              cancelText: "Cancel",
              onOk: () => {
                router.push(APP_ROUTES.LOGIN);
              },
            });
          }}
        />
      )}
    </>
  );
}

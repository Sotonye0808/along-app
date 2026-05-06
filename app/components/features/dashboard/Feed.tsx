"use client";

import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { RefreshCw } from "lucide-react";
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
import { ModalService } from "@/lib/services/modalService";
import { ToastService } from "@/lib/services/toastService";
import { UndoService } from "@/lib/services/undoService";
import { AppButton } from "@/components/ui/AppButton";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { PostCardSkeleton } from "@/components/ui/AppSkeleton";
import { EMPTY_STATES } from "@/lib/config/emptyStates";

export function Feed() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const router = useRouter();

  const currentUser = getCurrentUser();

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

  const handleShare = useCallback((postId: string) => {
    const shareUrl = `${window.location.origin}/posts/${postId}`;

    if (navigator.share) {
      navigator
        .share({ title: "Check out this route", url: shareUrl })
        .catch((error) => {
          if (error.name !== "AbortError") {
            void navigator.clipboard.writeText(shareUrl);
            ToastService.success("Link copied to clipboard");
          }
        });
    } else {
      void navigator.clipboard.writeText(shareUrl);
      ToastService.success("Link copied to clipboard");
    }
  }, []);

  const handleEdit = useCallback((post: Post) => {
    setPostToEdit(post);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((postId: string) => {
    // Optimistically remove post from feed, register undo action
    removePost(postId);
    let undone = false;

    UndoService.registerAction(
      "Post deleted",
      () => {
        // Undo: reload posts to restore
        undone = true;
        void fetchPosts();
        ToastService.info("Deletion cancelled");
      },
      10_000,
    );

    // Execute actual delete after TTL
    globalThis.setTimeout(() => {
      if (undone) return;
      api
        .delete(`${API_ENDPOINTS.POSTS}/${postId}`)
        .then(() => {
          ToastService.success("Post deleted permanently");
        })
        .catch(() => {
          void fetchPosts();
          ToastService.error("Failed to delete post");
        });
    }, 10_100);
  }, [removePost, fetchPosts]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <PostCardSkeleton key={n} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AppEmptyState
          title={EMPTY_STATES.noPosts.title}
          description={EMPTY_STATES.noPosts.description}
          icon={EMPTY_STATES.noPosts.icon}
          action={{ label: "Refresh", onClick: fetchPosts }}
        />
      </div>
    );
  }

  return (
    <>
      {hasNewPosts ? (
        <div className="fixed left-1/2 top-20 z-40 -translate-x-1/2">
          <AppButton
            icon={RefreshCw}
            onClick={() => handleLoadNewPosts(fetchPosts)}
            size="sm"
            className="shadow-lg">
            Load new posts
          </AppButton>
        </div>
      ) : null}

      <div className="space-y-4">
        {(posts || []).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            author={post.author}
            currentUserId={currentUser?.id}
            onLike={(postId) =>
              handleLike(postId, updatePostLikes, updatePostDislikes, fetchPosts)
            }
            onDislike={(postId) =>
              handleDislike(postId, updatePostLikes, updatePostDislikes, fetchPosts)
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

      {postToEdit ? (
        <Suspense fallback={null}>
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
      ) : null}

      {selectedPostId ? (
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
          onShowLoginModal={async () => {
            const confirmed = await ModalService.confirm({
              title: "Login required",
              description: "You need to be signed in to comment.",
              confirmLabel: "Sign in",
            });
            if (confirmed) {
              router.push(APP_ROUTES.LOGIN);
            }
          }}
        />
      ) : null}
    </>
  );
}

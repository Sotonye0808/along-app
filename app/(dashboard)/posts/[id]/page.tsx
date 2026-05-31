"use client";

import React, { useState, useEffect } from "react";
import { Spin, App, Button, Skeleton, Card } from "antd";
import { ArrowLeft, Eye, Share2, Bookmark, ThumbsUp, MessageCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { PostCard } from "@/components/features/posts/PostCard";
import { CommentSection } from "@/components/features/posts/CommentSection";
import { useAuth } from "../../../providers/AuthProvider";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { StructuredData } from "@/components/ui/StructuredData";
import { generateArticleSchema } from "@/lib/utils/structuredData";
import { getSiteUrl } from "@/lib/utils/metadata";
import { RouteMap } from "@/components/features/map";
import { formatNumber } from "@/lib/utils/format";
import { combinePostsWithAuthors } from "@/lib/utils/feedHelpers";
import Link from "next/link";

interface PostWithAuthor extends Post {
  author: User;
}

export default function PostPage() {
  const params = useParams();
  const postId = params?.id as string;
  const { user: currentUser, isAuthenticated } = useAuth();
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<(PostComment & { author: User })[]>(
    [],
  );
  const [relatedPosts, setRelatedPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [userInteractions, setUserInteractions] = useState({
    likes: new Set<string>(),
    dislikes: new Set<string>(),
    bookmarks: new Set<string>(),
    following: new Set<string>(),
  });
  const { message, modal } = App.useApp();
  const router = useRouter();

  useEffect(() => {
    if (!postId) return;
    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (!currentUser || !postId) return;
    fetchUserInteractions();
  }, [currentUser, postId]);

  const fetchRelatedPosts = async (tags: string[]) => {
    if (tags.length === 0) return;
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get<Post[]>(API_ENDPOINTS.POSTS),
        api.get<User[]>(API_ENDPOINTS.USERS),
      ]);
      const allPosts = postsRes.data ?? [];
      const related = allPosts
        .filter((p) => p.id !== postId && p.tags.some((t) => tags.includes(t)))
        .slice(0, 4);
      setRelatedPosts(
        combinePostsWithAuthors(related, usersRes.data ?? []) as PostWithAuthor[],
      );
    } catch {
      // silent
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const postRes = await api.get<Post>(`${API_ENDPOINTS.POSTS}/${postId}`);
      const authorRes = await api.get<User>(
        `${API_ENDPOINTS.USERS}/${postRes.data.userId}`,
      );

      const postData = {
        ...postRes.data,
        author: authorRes.data,
      };
      setPost(postData);
      void fetchRelatedPosts(postData.tags);
    } catch (error) {
      console.error("Failed to fetch post:", error);
      message.error("Post not found");
      router.push("/home");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInteractions = async () => {
    if (!currentUser || !postId) return;

    try {
      const likes = new Set<string>();
      const dislikes = new Set<string>();
      const bookmarks = new Set<string>();

      // Check if user has liked/disliked this post
      const likeCheck = await api.get<{ data: Like | null }>(
        `${API_ENDPOINTS.POST_LIKE(postId)}?userId=${currentUser.id}`,
      );

      if (likeCheck.data.data) {
        if (likeCheck.data.data.type === "like") {
          likes.add(postId);
        } else if (likeCheck.data.data.type === "dislike") {
          dislikes.add(postId);
        }
      }

      // Check if user has bookmarked this post
      const bookmarkCheck = await api.get<{ data: Bookmark | null }>(
        `${API_ENDPOINTS.POST_BOOKMARK(postId)}?userId=${currentUser.id}`,
      );

      if (bookmarkCheck.data.data) {
        bookmarks.add(postId);
      }

      setUserInteractions((prev) => ({
        ...prev,
        likes,
        dislikes,
        bookmarks,
      }));
    } catch (error) {
      console.error("Failed to fetch user interactions:", error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      message.warning("Please login to like posts");
      return;
    }

    const wasLiked = userInteractions.likes.has(postId);
    const wasDisliked = userInteractions.dislikes.has(postId);

    // Optimistic update
    const newLikes = new Set(userInteractions.likes);
    const newDislikes = new Set(userInteractions.dislikes);

    if (wasLiked) {
      newLikes.delete(postId);
      setPost((prev) => (prev ? { ...prev, likes: prev.likes - 1 } : null));
    } else {
      newLikes.add(postId);
      if (wasDisliked) {
        newDislikes.delete(postId);
        setPost((prev) =>
          prev
            ? { ...prev, likes: prev.likes + 1, dislikes: prev.dislikes - 1 }
            : null,
        );
      } else {
        setPost((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
      }
    }

    setUserInteractions((prev) => ({
      ...prev,
      likes: newLikes,
      dislikes: newDislikes,
    }));

    try {
      await api.post(API_ENDPOINTS.POST_LIKE(postId), {
        userId: currentUser.id,
        type: "like",
      });
    } catch (error) {
      // Rollback on error
      setUserInteractions((prev) => ({
        ...prev,
        likes: userInteractions.likes,
        dislikes: userInteractions.dislikes,
      }));
      fetchPost();
      message.error("Failed to like post");
    }
  };

  const handleDislike = async (postId: string) => {
    if (!currentUser) {
      message.warning("Please login to dislike posts");
      return;
    }

    const wasDisliked = userInteractions.dislikes.has(postId);
    const wasLiked = userInteractions.likes.has(postId);

    const newLikes = new Set(userInteractions.likes);
    const newDislikes = new Set(userInteractions.dislikes);

    if (wasDisliked) {
      newDislikes.delete(postId);
      setPost((prev) =>
        prev ? { ...prev, dislikes: prev.dislikes - 1 } : null,
      );
    } else {
      newDislikes.add(postId);
      if (wasLiked) {
        newLikes.delete(postId);
        setPost((prev) =>
          prev
            ? { ...prev, dislikes: prev.dislikes + 1, likes: prev.likes - 1 }
            : null,
        );
      } else {
        setPost((prev) =>
          prev ? { ...prev, dislikes: prev.dislikes + 1 } : null,
        );
      }
    }

    setUserInteractions((prev) => ({
      ...prev,
      likes: newLikes,
      dislikes: newDislikes,
    }));

    try {
      await api.post(API_ENDPOINTS.POST_LIKE(postId), {
        userId: currentUser.id,
        type: "dislike",
      });
    } catch (error) {
      setUserInteractions((prev) => ({
        ...prev,
        likes: userInteractions.likes,
        dislikes: userInteractions.dislikes,
      }));
      fetchPost();
      message.error("Failed to dislike post");
    }
  };

  const handleComment = async (postId: string) => {
    if (!currentUser) {
      modal.confirm({
        title: "Login Required",
        content:
          "You need to be logged in to comment. Would you like to login now?",
        okText: "Login",
        cancelText: "Cancel",
        onOk: () => {
          router.push("/login");
        },
      });
      return;
    }

    try {
      const commentsRes = await api.get<PostComment[]>(
        API_ENDPOINTS.POST_COMMENTS(postId),
      );

      const commentsWithAuthors = await Promise.all(
        (commentsRes.data || []).map(async (comment) => {
          const authorRes = await api.get<User>(
            `${API_ENDPOINTS.USERS}/${comment.userId}`,
          );
          return {
            ...comment,
            author: authorRes.data,
          };
        }),
      );

      setComments(commentsWithAuthors);
      setCommentModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      message.error("Failed to load comments");
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!currentUser) {
      message.warning("Please login to comment");
      throw new Error("User not logged in");
    }

    try {
      const newComment: Partial<PostComment> = {
        postId,
        userId: currentUser.id,
        text,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
      };

      await api.post(API_ENDPOINTS.POST_COMMENTS(postId), newComment);

      // Refresh comments
      await handleComment(postId);

      // Update comment count
      setPost((prev) =>
        prev ? { ...prev, comments: prev.comments + 1 } : null,
      );

      message.success("Comment added");
    } catch (error) {
      console.error("Failed to add comment:", error);
      message.error("Failed to add comment");
      throw error;
    }
  };

  const handleEditComment = async (commentId: string, newText: string) => {
    if (!currentUser || !postId) return;

    try {
      await api.put(`${API_ENDPOINTS.POST_COMMENTS(postId)}/${commentId}`, {
        text: newText,
      });

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, text: newText } : comment,
        ),
      );
    } catch (error) {
      console.error("Failed to update comment:", error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser || !postId) return;

    try {
      await api.delete(`${API_ENDPOINTS.POST_COMMENTS(postId)}/${commentId}`);

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      setPost((prev) =>
        prev ? { ...prev, comments: prev.comments - 1 } : null,
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser || !postId) {
      message.warning("Please login to like comments");
      return;
    }

    // Optimistic update
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c)),
    );

    try {
      await api.post(API_ENDPOINTS.POST_COMMENT_LIKE(postId, commentId), {
        userId: currentUser.id,
        type: "like",
      });
    } catch (error) {
      console.error("Failed to like comment:", error);
      message.error("Failed to update like");
      // Rollback
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes: c.likes - 1 } : c,
        ),
      );
    }
  };

  const handleDislikeComment = async (commentId: string) => {
    if (!currentUser || !postId) {
      message.warning("Please login to dislike comments");
      return;
    }

    // Optimistic update
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c,
      ),
    );

    try {
      await api.post(API_ENDPOINTS.POST_COMMENT_DISLIKE(postId, commentId), {
        userId: currentUser.id,
        type: "dislike",
      });
    } catch (error) {
      console.error("Failed to dislike comment:", error);
      message.error("Failed to update dislike");
      // Rollback
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, dislikes: c.dislikes - 1 } : c,
        ),
      );
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!currentUser) {
      message.warning("Please login to bookmark posts");
      return;
    }

    const wasBookmarked = userInteractions.bookmarks.has(postId);
    const newBookmarks = new Set(userInteractions.bookmarks);

    if (wasBookmarked) {
      newBookmarks.delete(postId);
      setPost((prev) =>
        prev ? { ...prev, bookmarks: (prev.bookmarks || 0) - 1 } : null,
      );
    } else {
      newBookmarks.add(postId);
      setPost((prev) =>
        prev ? { ...prev, bookmarks: (prev.bookmarks || 0) + 1 } : null,
      );
    }

    setUserInteractions((prev) => ({
      ...prev,
      bookmarks: newBookmarks,
    }));

    try {
      if (wasBookmarked) {
        await api.delete(
          `${API_ENDPOINTS.POST_BOOKMARK(postId)}?userId=${currentUser.id}`,
        );
        message.success("Removed from bookmarks");
      } else {
        await api.post(API_ENDPOINTS.POST_BOOKMARK(postId), {
          userId: currentUser.id,
        });
        message.success("Added to bookmarks");
      }
    } catch (error) {
      setUserInteractions((prev) => ({
        ...prev,
        bookmarks: userInteractions.bookmarks,
      }));
      fetchPost();
      message.error("Failed to update bookmark");
    }
  };

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/posts/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || "Check out this route on Along",
          url: shareUrl,
        });
      } catch (error: any) {
        if (error.name !== "AbortError") {
          navigator.clipboard.writeText(shareUrl);
          message.success("Link copied to clipboard");
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      message.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Button
          type="text"
          icon={<ArrowLeft />}
          onClick={() => router.back()}
          className="mb-4">
          Back
        </Button>
        <Card>
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  if (!postId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Invalid post ID
        </p>
        <Button
          type="primary"
          onClick={() => router.push("/home")}
          className="bg-[var(--color-primary)]">
          Back to Feed
        </Button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Post not found
        </p>
        <Button
          type="primary"
          onClick={() => router.push("/home")}
          className="bg-[var(--color-primary)]">
          Back to Feed
        </Button>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const currentBaseUrl = getSiteUrl();
  const articleSchema = generateArticleSchema(
    post,
    post.author,
    currentBaseUrl,
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <StructuredData data={articleSchema} />

      <div className="flex items-center justify-between mb-4">
        <Button
          type="text"
          icon={<ArrowLeft />}
          onClick={() => router.back()}>
          Back
        </Button>

        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1.5">
            <Eye size={16} />
            {formatNumber(post.views || 0)}
          </span>
          <span className="flex items-center gap-1.5">
            <Share2 size={16} />
            {formatNumber(post.shares || 0)}
          </span>
          <span className="flex items-center gap-1.5">
            <Bookmark size={16} />
            {formatNumber(post.saves || 0)}
          </span>
        </div>
      </div>

      <PostCard
        post={post}
        author={post.author}
        currentUserId={currentUser?.id}
        onLike={handleLike}
        onDislike={handleDislike}
        onComment={handleComment}
        onBookmark={handleBookmark}
        onShare={handleShare}
        isLiked={userInteractions.likes.has(post.id)}
        isDisliked={userInteractions.dislikes.has(post.id)}
        isBookmarked={userInteractions.bookmarks.has(post.id)}
      />

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { icon: ThumbsUp, label: "Likes", value: post.likes },
          { icon: MessageCircle, label: "Comments", value: post.comments },
          { icon: Eye, label: "Views", value: post.views || 0 },
          { icon: Share2, label: "Shares", value: post.shares || 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--color-bg-elevated)] rounded-lg p-3 text-center">
            <stat.icon size={18} className="mx-auto mb-1 text-[var(--color-text-secondary)]" />
            <div className="text-lg font-semibold text-[var(--color-text-primary)]">{formatNumber(stat.value)}</div>
            <div className="text-xs text-[var(--color-text-muted)]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Route Map — inline on desktop, collapsible on mobile */}
      <div className="mt-4">
        <div className="hidden md:block">
          <RouteMap post={post} height={300} />
        </div>
        <div className="md:hidden">
          <RouteMap post={post} height={240} collapsible />
        </div>
      </div>

      {/* Comment Section Modal */}
      {commentModalOpen && (
        <CommentSection
          open={commentModalOpen}
          onClose={() => {
            setCommentModalOpen(false);
            setComments([]);
          }}
          postId={postId}
          comments={comments}
          currentUser={currentUser}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onDislikeComment={handleDislikeComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          onShowLoginModal={() => {
            modal.confirm({
              title: "Login Required",
              content:
                "You need to be logged in to interact with comments. Would you like to login now?",
              okText: "Login",
              cancelText: "Cancel",
              onOk: () => {
                router.push("/login");
              },
            });
          }}
        />
      )}

      {/* Related Routes — per design spec: horizontal cards */}
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-3 text-[var(--color-text-primary)]">
          Related Routes
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          {relatedPosts.length > 0
            ? relatedPosts.slice(0, 4).map((rp) => (
                <Link
                  key={rp.id}
                  href={`/posts/${rp.id}`}
                  className="flex-none w-56 group">
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] overflow-hidden transition-all hover:shadow-[0_8px_32px_rgba(0,98,59,0.15)] hover:-translate-y-0.5">
                    {/* Image placeholder */}
                    <div className="h-28 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary-light)]/10 flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                    </div>
                    {/* Card body */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1 group-hover:text-[var(--color-primary)]">
                        {rp.title}
                      </p>
                      <div className="text-xs text-[var(--color-text-muted)] mt-1">
                        {rp.totalDistanceKm ? `${rp.totalDistanceKm} km` : ""}
                        {rp.totalDistanceKm && rp.estimatedMins ? " · " : ""}
                        {rp.estimatedMins ? `${rp.estimatedMins} min` : ""}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 text-[10px] font-semibold flex items-center justify-center text-[var(--color-primary)]">
                          {(rp.author?.firstName?.[0] ?? "U").toUpperCase()}
                        </div>
                        <span className="text-xs text-[var(--color-text-secondary)] truncate">
                          {rp.author?.firstName ?? "User"}
                        </span>
                        {typeof rp.validityScore === "number" && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium">
                            {rp.validityScore >= 80 ? "Trusted" : rp.validityScore >= 60 ? "Verified" : rp.validityScore >= 30 ? "Developing" : "Low"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            : post.tags.slice(0, 4).map((tag) => (
                <Link
                  key={tag}
                  href={`/explore?tag=${encodeURIComponent(tag)}`}
                  className="flex-none px-4 py-2 rounded-full bg-[var(--color-bg-elevated)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                  #{tag}
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}

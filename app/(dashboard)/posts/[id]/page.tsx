"use client";

import React, { useState, useEffect } from "react";
import { Spin, App, Button, Skeleton, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { PostCard } from "@/components/features/posts/PostCard";
import { CommentSection } from "@/components/features/posts/CommentSection";
import { useAuth } from "../../../providers/AuthProvider";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { generateArticleSchema } from "@/lib/utils/structuredData";

interface PostWithAuthor extends Post {
  author: User;
}

export default function PostPage() {
  const params = useParams();
  const postId = params?.id as string;
  const { user: currentUser, isAuthenticated } = useAuth();
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<(PostComment & { author: User })[]>(
    []
  );
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

  const fetchPost = async () => {
    try {
      setLoading(true);
      const postRes = await api.get<Post>(`${API_ENDPOINTS.POSTS}/${postId}`);
      const authorRes = await api.get<User>(
        `${API_ENDPOINTS.USERS}/${postRes.data.userId}`
      );

      setPost({
        ...postRes.data,
        author: authorRes.data,
      });
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
        `${API_ENDPOINTS.POST_LIKE(postId)}?userId=${currentUser.id}`
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
        `${API_ENDPOINTS.POST_BOOKMARK(postId)}?userId=${currentUser.id}`
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
            : null
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
        prev ? { ...prev, dislikes: prev.dislikes - 1 } : null
      );
    } else {
      newDislikes.add(postId);
      if (wasLiked) {
        newLikes.delete(postId);
        setPost((prev) =>
          prev
            ? { ...prev, dislikes: prev.dislikes + 1, likes: prev.likes - 1 }
            : null
        );
      } else {
        setPost((prev) =>
          prev ? { ...prev, dislikes: prev.dislikes + 1 } : null
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
        API_ENDPOINTS.POST_COMMENTS(postId)
      );

      const commentsWithAuthors = await Promise.all(
        commentsRes.data.map(async (comment) => {
          const authorRes = await api.get<User>(
            `${API_ENDPOINTS.USERS}/${comment.userId}`
          );
          return {
            ...comment,
            author: authorRes.data,
          };
        })
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
        prev ? { ...prev, comments: prev.comments + 1 } : null
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
          comment.id === commentId ? { ...comment, text: newText } : comment
        )
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
        prev ? { ...prev, comments: prev.comments - 1 } : null
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
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
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
        prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes - 1 } : c))
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
        c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c
      )
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
          c.id === commentId ? { ...c, dislikes: c.dislikes - 1 } : c
        )
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
        prev ? { ...prev, bookmarks: (prev.bookmarks || 0) - 1 } : null
      );
    } else {
      newBookmarks.add(postId);
      setPost((prev) =>
        prev ? { ...prev, bookmarks: (prev.bookmarks || 0) + 1 } : null
      );
    }

    setUserInteractions((prev) => ({
      ...prev,
      bookmarks: newBookmarks,
    }));

    try {
      if (wasBookmarked) {
        await api.delete(
          `${API_ENDPOINTS.POST_BOOKMARK(postId)}?userId=${currentUser.id}`
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
          icon={<ArrowLeftOutlined />}
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
          className="bg-[#00623B]">
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
          className="bg-[#00623B]">
          Back to Feed
        </Button>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const articleSchema = generateArticleSchema(post, post.author, baseUrl);

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        className="mb-4">
        Back
      </Button>

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
    </div>
  );
}

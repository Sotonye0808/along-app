"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/features/posts/PostCard";
import { useAuth } from "../../providers/AuthProvider";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS, APP_ROUTES } from "@/lib/constants";
import { ToastService } from "@/lib/services/toastService";
import { ModalService } from "@/lib/services/modalService";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { EMPTY_STATES } from "@/lib/config/emptyStates";

interface PostWithAuthor extends Post {
  author: User;
}

export default function BookmarksPage(): React.ReactElement {
  const { user, isAuthenticated } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInteractions, setUserInteractions] = useState({
    likes: new Set<string>(),
    dislikes: new Set<string>(),
    bookmarks: new Set<string>(),
  });
  const router = useRouter();

  const fetchBookmarkedPosts = useCallback(async () => {
    if (!user) return;
    try {
      const [postsResponse, usersResponse] = await Promise.all([
        api.get<Post[]>(API_ENDPOINTS.POSTS),
        api.get<User[]>(API_ENDPOINTS.USERS),
      ]);
      const usersMap = new Map(
        (usersResponse.data || []).map((u) => [u.id, u]),
      );
      const bookmarkedPostIds = user.bookmarks ?? [];
      const bookmarked = postsResponse.data
        .filter((post) => bookmarkedPostIds.includes(post.id))
        .map((post) => ({
          ...post,
          author:
            usersMap.get(post.userId) ??
            ({
              id: post.userId,
              userName: "unknown",
              firstName: "Unknown",
              lastName: "User",
              email: "",
              createdAt: new Date().toISOString(),
            } as User),
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      setBookmarkedPosts(bookmarked);
    } catch {
      ToastService.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUserInteractions = useCallback(async () => {
    if (!user) return;
    try {
      const postsResponse = await api.get<Post[]>(API_ENDPOINTS.POSTS);
      const likes = new Set<string>();
      const dislikes = new Set<string>();
      const bookmarks = new Set(user.bookmarks ?? []);
      for (const post of postsResponse.data) {
        try {
          const likeCheck = await api.get<Like | null>(
            `${API_ENDPOINTS.POST_LIKE(post.id)}?userId=${user.id}`,
          );
          if (likeCheck.data) {
            if (likeCheck.data.type === "like") likes.add(post.id);
            else if (likeCheck.data.type === "dislike") dislikes.add(post.id);
          }
        } catch {
          // ignore
        }
      }
      setUserInteractions({ likes, dislikes, bookmarks });
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      const run = async () => {
        const confirmed = await ModalService.confirm({
          title: "Login required",
          description: "You need to be signed in to view your bookmarks.",
          confirmLabel: "Sign in",
          cancelLabel: "Go home",
        });
        router.push(confirmed ? APP_ROUTES.LOGIN : APP_ROUTES.HOME);
      };
      void run();
      setLoading(false);
      return;
    }
    void fetchBookmarkedPosts();
    void fetchUserInteractions();
  }, [user, isAuthenticated, fetchBookmarkedPosts, fetchUserInteractions, router]);

  const handleLike = async (postId: string) => {
    if (!user) return;
    const wasLiked = userInteractions.likes.has(postId);
    const wasDisliked = userInteractions.dislikes.has(postId);
    try {
      setUserInteractions((prev) => {
        const newLikes = new Set(prev.likes);
        const newDislikes = new Set(prev.dislikes);
        if (wasLiked) {
          newLikes.delete(postId);
        } else {
          newLikes.add(postId);
          newDislikes.delete(postId);
        }
        return { ...prev, likes: newLikes, dislikes: newDislikes };
      });
      setBookmarkedPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: wasLiked ? post.likes - 1 : post.likes + 1,
                dislikes: wasDisliked ? post.dislikes - 1 : post.dislikes,
              }
            : post,
        ),
      );
      await api.post(API_ENDPOINTS.POST_LIKE(postId), {
        userId: user.id,
        type: wasLiked ? null : "like",
      });
    } catch {
      ToastService.error("Failed to update like");
      void fetchBookmarkedPosts();
      void fetchUserInteractions();
    }
  };

  const handleDislike = async (postId: string) => {
    if (!user) return;
    const wasDisliked = userInteractions.dislikes.has(postId);
    const wasLiked = userInteractions.likes.has(postId);
    try {
      setUserInteractions((prev) => {
        const newLikes = new Set(prev.likes);
        const newDislikes = new Set(prev.dislikes);
        if (wasDisliked) {
          newDislikes.delete(postId);
        } else {
          newDislikes.add(postId);
          newLikes.delete(postId);
        }
        return { ...prev, likes: newLikes, dislikes: newDislikes };
      });
      setBookmarkedPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                dislikes: wasDisliked ? post.dislikes - 1 : post.dislikes + 1,
                likes: wasLiked ? post.likes - 1 : post.likes,
              }
            : post,
        ),
      );
      await api.post(API_ENDPOINTS.POST_LIKE(postId), {
        userId: user.id,
        type: wasDisliked ? null : "dislike",
      });
    } catch {
      ToastService.error("Failed to update dislike");
      void fetchBookmarkedPosts();
      void fetchUserInteractions();
    }
  };

  const handleComment = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;
    const wasBookmarked = userInteractions.bookmarks.has(postId);
    try {
      setUserInteractions((prev) => {
        const newBookmarks = new Set(prev.bookmarks);
        if (wasBookmarked) {
          newBookmarks.delete(postId);
        } else {
          newBookmarks.add(postId);
        }
        return { ...prev, bookmarks: newBookmarks };
      });
      if (wasBookmarked) {
        setBookmarkedPosts((prev) => prev.filter((post) => post.id !== postId));
      }
      await api.post(API_ENDPOINTS.POST_BOOKMARK(postId), {
        userId: user.id,
        action: wasBookmarked ? "remove" : "add",
      });
      ToastService.success(
        wasBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      );
    } catch {
      ToastService.error("Failed to update bookmark");
      void fetchBookmarkedPosts();
      void fetchUserInteractions();
    }
  };

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/posts/${postId}`;
    if (navigator.share) {
      navigator
        .share({ title: "Check out this route on Along", url: shareUrl })
        .catch(() => {
          void navigator.clipboard.writeText(shareUrl);
          ToastService.success("Link copied to clipboard");
        });
    } else {
      void navigator.clipboard.writeText(shareUrl);
      ToastService.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <AppSpinner size={32} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <></>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">
        Saved Routes
      </h1>

      {bookmarkedPosts.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <AppEmptyState
            title={EMPTY_STATES.noBookmarks.title}
            description={EMPTY_STATES.noBookmarks.description}
            icon={EMPTY_STATES.noBookmarks.icon}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={post.author}
              currentUserId={user.id}
              onLike={handleLike}
              onDislike={handleDislike}
              onComment={handleComment}
              onBookmark={handleBookmark}
              onShare={handleShare}
              isLiked={userInteractions.likes.has(post.id)}
              isDisliked={userInteractions.dislikes.has(post.id)}
              isBookmarked={userInteractions.bookmarks.has(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}


interface PostWithAuthor extends Post {
  author: User;
}

export default function BookmarksPage() {
  const { user, isAuthenticated } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInteractions, setUserInteractions] = useState({
    likes: new Set<string>(),
    dislikes: new Set<string>(),
    bookmarks: new Set<string>(),
  });
  const { message, modal } = App.useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      modal.confirm({
        title: "Login Required",
        content:
          "You need to be logged in to view your bookmarks. Would you like to login now?",
        okText: "Login",
        cancelText: "Cancel",
        onOk: () => {
          router.push(APP_ROUTES.LOGIN);
        },
        onCancel: () => {
          router.push(APP_ROUTES.HOME);
        },
      });
      setLoading(false);
      return;
    }

    fetchBookmarkedPosts();
    fetchUserInteractions();
  }, [user, isAuthenticated]);

  const fetchBookmarkedPosts = async () => {
    if (!user) return;

    try {
      // Fetch all posts
      const postsResponse = await api.get<Post[]>(API_ENDPOINTS.POSTS);
      const allPosts = postsResponse.data;

      // Fetch all users
      const usersResponse = await api.get<User[]>(API_ENDPOINTS.USERS);
      const usersMap = new Map(
        (usersResponse.data || []).map((u) => [u.id, u])
      );

      // Filter posts that user has bookmarked
      const bookmarkedPostIds = user.bookmarks || [];
      const bookmarked = allPosts
        .filter((post) => bookmarkedPostIds.includes(post.id))
        .map((post) => ({
          ...post,
          author:
            usersMap.get(post.userId) ||
            ({
              id: post.userId,
              userName: "unknown",
              firstName: "Unknown",
              lastName: "User",
              email: "",
              createdAt: new Date().toISOString(),
            } as User),
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setBookmarkedPosts(bookmarked);
    } catch (error) {
      console.error("Failed to fetch bookmarked posts:", error);
      message.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInteractions = async () => {
    if (!user) return;

    try {
      const postsResponse = await api.get<Post[]>(API_ENDPOINTS.POSTS);
      const likes = new Set<string>();
      const dislikes = new Set<string>();
      const bookmarks = new Set(user.bookmarks || []);

      for (const post of postsResponse.data) {
        try {
          // Check likes/dislikes
          const likeCheck = await api.get<Like | null>(
            `${API_ENDPOINTS.POST_LIKE(post.id)}?userId=${user.id}`
          );

          if (likeCheck.data) {
            if (likeCheck.data.type === "like") {
              likes.add(post.id);
            } else if (likeCheck.data.type === "dislike") {
              dislikes.add(post.id);
            }
          }
        } catch (error) {
          // Ignore errors for individual posts
        }
      }

      setUserInteractions({ likes, dislikes, bookmarks });
    } catch (error) {
      console.error("Failed to fetch user interactions:", error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const wasLiked = userInteractions.likes.has(postId);
    const wasDisliked = userInteractions.dislikes.has(postId);

    try {
      // Optimistic update
      setUserInteractions((prev) => {
        const newLikes = new Set(prev.likes);
        const newDislikes = new Set(prev.dislikes);

        if (wasLiked) {
          newLikes.delete(postId);
        } else {
          newLikes.add(postId);
          newDislikes.delete(postId);
        }

        return { ...prev, likes: newLikes, dislikes: newDislikes };
      });

      setBookmarkedPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: wasLiked ? post.likes - 1 : post.likes + 1,
                dislikes: wasDisliked ? post.dislikes - 1 : post.dislikes,
              }
            : post
        )
      );

      // Make API call
      await api.post(API_ENDPOINTS.POST_LIKE(postId), {
        userId: user.id,
        type: wasLiked ? null : "like",
      });
    } catch (error) {
      console.error("Failed to like post:", error);
      message.error("Failed to update like");
      // Rollback
      fetchBookmarkedPosts();
      fetchUserInteractions();
    }
  };

  const handleDislike = async (postId: string) => {
    if (!user) return;

    const wasDisliked = userInteractions.dislikes.has(postId);
    const wasLiked = userInteractions.likes.has(postId);

    try {
      // Optimistic update
      setUserInteractions((prev) => {
        const newLikes = new Set(prev.likes);
        const newDislikes = new Set(prev.dislikes);

        if (wasDisliked) {
          newDislikes.delete(postId);
        } else {
          newDislikes.add(postId);
          newLikes.delete(postId);
        }

        return { ...prev, likes: newLikes, dislikes: newDislikes };
      });

      setBookmarkedPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                dislikes: wasDisliked ? post.dislikes - 1 : post.dislikes + 1,
                likes: wasLiked ? post.likes - 1 : post.likes,
              }
            : post
        )
      );

      // Make API call
      await api.post(API_ENDPOINTS.POST_LIKE(postId), {
        userId: user.id,
        type: wasDisliked ? null : "dislike",
      });
    } catch (error) {
      console.error("Failed to dislike post:", error);
      message.error("Failed to update dislike");
      // Rollback
      fetchBookmarkedPosts();
      fetchUserInteractions();
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to post detail or open comment modal
    message.info("Comment functionality - to be enhanced");
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;

    const wasBookmarked = userInteractions.bookmarks.has(postId);

    try {
      // Optimistic update
      setUserInteractions((prev) => {
        const newBookmarks = new Set(prev.bookmarks);
        if (wasBookmarked) {
          newBookmarks.delete(postId);
        } else {
          newBookmarks.add(postId);
        }
        return { ...prev, bookmarks: newBookmarks };
      });

      // Remove from list if unbookmarking
      if (wasBookmarked) {
        setBookmarkedPosts((prev) => prev.filter((post) => post.id !== postId));
      }

      // Update bookmark count
      setBookmarkedPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                bookmarks: wasBookmarked
                  ? (post.bookmarks || 1) - 1
                  : (post.bookmarks || 0) + 1,
              }
            : post
        )
      );

      // Make API call
      await api.post(API_ENDPOINTS.POST_BOOKMARK(postId), {
        userId: user.id,
        action: wasBookmarked ? "remove" : "add",
      });

      message.success(
        wasBookmarked ? "Removed from bookmarks" : "Added to bookmarks"
      );
    } catch (error) {
      console.error("Failed to bookmark post:", error);
      message.error("Failed to update bookmark");
      // Rollback
      fetchBookmarkedPosts();
      fetchUserInteractions();
    }
  };

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/posts/${postId}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Check out this route on Along",
          url: shareUrl,
        })
        .catch(() => {
          navigator.clipboard.writeText(shareUrl);
          message.success("Link copied to clipboard");
        });
    } else {
      navigator.clipboard.writeText(shareUrl);
      message.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Modal will show
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Saved Routes
      </h1>

      {bookmarkedPosts.length === 0 ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Empty
            description="No bookmarked routes yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {(bookmarkedPosts || []).map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={post.author}
              currentUserId={user.id}
              onLike={handleLike}
              onDislike={handleDislike}
              onComment={handleComment}
              onBookmark={handleBookmark}
              onShare={handleShare}
              isLiked={userInteractions.likes.has(post.id)}
              isDisliked={userInteractions.dislikes.has(post.id)}
              isBookmarked={userInteractions.bookmarks.has(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

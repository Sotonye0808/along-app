"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Empty, Spin, Button, App, Modal, Skeleton, Card } from "antd";
import { ReloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { PostCard } from "@/components/features/posts/PostCard";
import { CommentSection } from "@/components/features/posts/CommentSection";
const ShareRouteModal = lazy(() =>
  import("@/components/features/posts/ShareRouteModal").then((mod) => ({
    default: mod.ShareRouteModal,
  }))
);
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface PostWithAuthor extends Post {
  author: User;
}

interface UserInteractions {
  likes: Set<string>; // Set of post IDs the user has liked
  dislikes: Set<string>; // Set of post IDs the user has disliked
  bookmarks: Set<string>; // Set of post IDs the user has bookmarked
  following: Set<string>; // Set of user IDs the user is following
}

export function Feed() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<(PostComment & { author: User })[]>(
    []
  );
  const [userInteractions, setUserInteractions] = useState<UserInteractions>({
    likes: new Set(),
    dislikes: new Set(),
    bookmarks: new Set(),
    following: new Set(),
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [scrolledDown, setScrolledDown] = useState(false);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const { message, modal } = App.useApp();

  // Get current user from localStorage (or auth context)
  const getCurrentUser = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchPosts();
    if (currentUser) {
      fetchUserInteractions();
    }

    // Track scroll position
    const handleScroll = () => {
      setScrolledDown(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check for new posts periodically when user has scrolled down
  useEffect(() => {
    if (!scrolledDown) {
      setHasNewPosts(false);
      return;
    }

    const checkForNewPosts = async () => {
      try {
        const response = await api.get<Post[]>(API_ENDPOINTS.POSTS);
        if (response.data.length > posts.length) {
          setHasNewPosts(true);
        }
      } catch (error) {
        console.error("Failed to check for new posts:", error);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkForNewPosts, 30000);
    return () => clearInterval(interval);
  }, [scrolledDown, posts.length]);

  const handleLoadNewPosts = async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setHasNewPosts(false);
    await fetchPosts();
  };

  const fetchUserInteractions = async () => {
    if (!currentUser) return;

    try {
      const likes = new Set<string>();
      const dislikes = new Set<string>();
      const bookmarks = new Set<string>();

      // Fetch all posts first
      const postsRes = await api.get<Post[]>(API_ENDPOINTS.POSTS);

      // Check each post for user's interactions using GET requests
      for (const post of postsRes.data) {
        try {
          // Check if user has liked/disliked this post
          const likeCheck = await api.get<{ data: Like | null }>(
            `${API_ENDPOINTS.POST_LIKE(post.id)}?userId=${currentUser.id}`
          );

          if (likeCheck.data.data) {
            if (likeCheck.data.data.type === "like") {
              likes.add(post.id);
            } else if (likeCheck.data.data.type === "dislike") {
              dislikes.add(post.id);
            }
          }

          // Check if user has bookmarked this post
          const bookmarkCheck = await api.get<{ data: Bookmark | null }>(
            `${API_ENDPOINTS.POST_BOOKMARK(post.id)}?userId=${currentUser.id}`
          );

          if (bookmarkCheck.data.data) {
            bookmarks.add(post.id);
          }
        } catch (error) {
          // Continue if individual check fails
          console.error(
            `Failed to check interactions for post ${post.id}:`,
            error
          );
        }
      }

      setUserInteractions({ likes, dislikes, bookmarks, following: new Set() });

      // Fetch following list separately
      fetchUserFollowing();
    } catch (error) {
      console.error("Failed to fetch user interactions:", error);
    }
  };

  const fetchUserFollowing = async () => {
    if (!currentUser) return;

    try {
      // Get user data to access following array
      const userResponse = await api.get<User>(
        API_ENDPOINTS.USER_BY_ID(currentUser.id)
      );

      const followingSet = new Set(userResponse.data.following || []);

      setUserInteractions((prev) => ({
        ...prev,
        following: followingSet,
      }));
    } catch (error) {
      console.error("Failed to fetch following list:", error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Fetch posts
      const postsResponse = await api.get<Post[]>(API_ENDPOINTS.POSTS);
      const postsData = postsResponse.data;

      // Fetch users
      const usersResponse = await api.get<User[]>(API_ENDPOINTS.USERS);
      const usersData = usersResponse.data;

      // Combine posts with authors
      const postsWithAuthors = postsData.map((post) => ({
        ...post,
        author: usersData.find((user) => user.id === post.userId) || {
          id: post.userId,
          userName: "unknown",
          firstName: "Unknown",
          lastName: "User",
          email: "",
          createdAt: new Date().toISOString(),
        },
      }));

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      message.error("Failed to load posts");
    } finally {
      setLoading(false);
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
      // Unlike
      newLikes.delete(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        )
      );
    } else {
      // Like (and remove dislike if exists)
      newLikes.add(postId);
      if (wasDisliked) {
        newDislikes.delete(postId);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, likes: post.likes + 1, dislikes: post.dislikes - 1 }
              : post
          )
        );
      } else {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
      }
    }

    setUserInteractions({
      ...userInteractions,
      likes: newLikes,
      dislikes: newDislikes,
    });

    try {
      if (wasLiked) {
        // Remove like
        await api.delete(`${API_ENDPOINTS.POST_LIKE(postId)}`, {
          data: { userId: currentUser.id },
        });
        message.success("Like removed");
      } else {
        // Add like (this will automatically remove dislike if exists)
        await api.post(`${API_ENDPOINTS.POST_LIKE(postId)}`, {
          userId: currentUser.id,
          type: "like",
        });
        message.success("Post liked");
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      message.error("Failed to update like");

      // Rollback on error
      setUserInteractions(userInteractions);
      await fetchPosts();
    }
  };

  const handleDislike = async (postId: string) => {
    if (!currentUser) {
      message.warning("Please login to dislike posts");
      return;
    }

    const wasDisliked = userInteractions.dislikes.has(postId);
    const wasLiked = userInteractions.likes.has(postId);

    // Optimistic update
    const newLikes = new Set(userInteractions.likes);
    const newDislikes = new Set(userInteractions.dislikes);

    if (wasDisliked) {
      // Remove dislike
      newDislikes.delete(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, dislikes: post.dislikes - 1 } : post
        )
      );
    } else {
      // Dislike (and remove like if exists)
      newDislikes.add(postId);
      if (wasLiked) {
        newLikes.delete(postId);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, dislikes: post.dislikes + 1, likes: post.likes - 1 }
              : post
          )
        );
      } else {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, dislikes: post.dislikes + 1 } : post
          )
        );
      }
    }

    setUserInteractions({
      ...userInteractions,
      likes: newLikes,
      dislikes: newDislikes,
    });

    try {
      if (wasDisliked) {
        // Remove dislike
        await api.delete(`${API_ENDPOINTS.POST_LIKE(postId)}`, {
          data: { userId: currentUser.id },
        });
        message.success("Dislike removed");
      } else {
        // Add dislike (this will automatically remove like if exists)
        await api.post(`${API_ENDPOINTS.POST_LIKE(postId)}`, {
          userId: currentUser.id,
          type: "dislike",
        });
        message.success("Post disliked");
      }
    } catch (error) {
      console.error("Failed to dislike post:", error);
      message.error("Failed to update dislike");

      // Rollback on error
      setUserInteractions(userInteractions);
      await fetchPosts();
    }
  };

  const handleComment = async (postId: string) => {
    setSelectedPostId(postId);

    try {
      // Fetch comments for this post
      const commentsResponse = await api.get<PostComment[]>(
        API_ENDPOINTS.POST_COMMENTS(postId)
      );
      const postComments = commentsResponse.data;

      // Fetch users for comment authors
      const usersResponse = await api.get<User[]>(API_ENDPOINTS.USERS);
      const usersData = usersResponse.data;

      const commentsWithAuthors = postComments.map((comment) => ({
        ...comment,
        author: usersData.find((user) => user.id === comment.userId) || {
          id: comment.userId,
          userName: "unknown",
          firstName: "Unknown",
          lastName: "User",
          email: "",
          createdAt: new Date().toISOString(),
        },
      }));

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
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: post.comments + 1 } : post
        )
      );

      message.success("Comment added");
    } catch (error) {
      console.error("Failed to add comment:", error);
      message.error("Failed to add comment");
      throw error;
    }
  };

  const handleEditComment = async (commentId: string, newText: string) => {
    if (!currentUser) {
      message.warning("Please login to edit comments");
      throw new Error("User not logged in");
    }

    try {
      await api.put(
        `${API_ENDPOINTS.POST_COMMENTS(selectedPostId!)}/${commentId}`,
        {
          text: newText,
        }
      );

      // Update local state
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
    if (!currentUser || !selectedPostId) return;

    try {
      await api.delete(
        `${API_ENDPOINTS.POST_COMMENTS(selectedPostId)}/${commentId}`
      );

      // Update local state
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      // Update comment count
      setPosts((prev) =>
        prev.map((post) =>
          post.id === selectedPostId
            ? { ...post, comments: post.comments - 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!currentUser) {
      message.warning("Please login to bookmark posts");
      return;
    }

    const wasBookmarked = userInteractions.bookmarks.has(postId);

    // Optimistic update
    const newBookmarks = new Set(userInteractions.bookmarks);

    if (wasBookmarked) {
      // Remove bookmark
      newBookmarks.delete(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, bookmarks: (post.bookmarks || 0) - 1 }
            : post
        )
      );
    } else {
      // Add bookmark
      newBookmarks.add(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, bookmarks: (post.bookmarks || 0) + 1 }
            : post
        )
      );
    }

    setUserInteractions({
      ...userInteractions,
      bookmarks: newBookmarks,
    });

    try {
      if (wasBookmarked) {
        // Remove bookmark
        await api.delete(`${API_ENDPOINTS.POST_BOOKMARK(postId)}`, {
          data: { userId: currentUser.id },
        });
        message.success("Bookmark removed");
      } else {
        // Add bookmark
        await api.post(`${API_ENDPOINTS.POST_BOOKMARK(postId)}`, {
          userId: currentUser.id,
        });
        message.success("Post bookmarked");
      }
    } catch (error) {
      console.error("Failed to bookmark post:", error);
      message.error("Failed to update bookmark");

      // Rollback on error
      setUserInteractions(userInteractions);
      await fetchPosts();
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
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(shareUrl);
          message.success("Link copied to clipboard");
        });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      message.success("Link copied to clipboard");
    }
  };

  const handleEdit = (post: Post) => {
    setPostToEdit(post);
    setEditModalOpen(true);
  };

  const handleUpdatePost = async (postData: Partial<Post>) => {
    if (!postData.id) return;

    try {
      await api.put(`${API_ENDPOINTS.POSTS}/${postData.id}`, postData);

      // Update the post in the local state
      setPosts((prev) =>
        prev.map((p) => (p.id === postData.id ? { ...p, ...postData } : p))
      );

      message.success("Post updated successfully!");
      setEditModalOpen(false);
      setPostToEdit(null);
    } catch (error) {
      console.error("Failed to update post:", error);
      throw error;
    }
  };

  const handleDelete = (postId: string) => {
    const { notification } = App.useApp();
    const key = `delete-post-${postId}`;
    let undoClicked = false;

    notification.open({
      key,
      message: "Post deleted",
      description: "Undo within 10 seconds",
      duration: 10,
      btn: (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            undoClicked = true;
            notification.destroy(key);
            message.info("Deletion cancelled");
          }}>
          Undo
        </Button>
      ),
      onClose: async () => {
        if (!undoClicked) {
          try {
            await api.delete(`${API_ENDPOINTS.POSTS}/${postId}`);

            // Remove the post from local state
            setPosts((prev) => prev.filter((p) => p.id !== postId));

            message.success("Post deleted permanently");
          } catch (error) {
            console.error("Failed to delete post:", error);
            message.error("Failed to delete post");
          }
        }
      },
    });
  };

  const handleFollow = async (userId: string) => {
    if (!currentUser) {
      message.warning("Please login to follow users");
      return;
    }

    const isCurrentlyFollowing = userInteractions.following.has(userId);

    // Optimistic update
    setUserInteractions((prev) => {
      const newFollowing = new Set(prev.following);
      if (isCurrentlyFollowing) {
        newFollowing.delete(userId);
      } else {
        newFollowing.add(userId);
      }
      return { ...prev, following: newFollowing };
    });

    // Update follower count optimistically
    setPosts((prev) =>
      prev.map((post) =>
        post.userId === userId
          ? {
              ...post,
              author: {
                ...post.author,
                followers: isCurrentlyFollowing
                  ? (post.author.followers || 0) - 1
                  : (post.author.followers || 0) + 1,
              },
            }
          : post
      )
    );

    try {
      await api.post(API_ENDPOINTS.USER_FOLLOW(userId), {
        userId: currentUser.id,
      });

      message.success(
        isCurrentlyFollowing
          ? `Unfollowed @${
              posts.find((p) => p.userId === userId)?.author.userName
            }`
          : `Now following @${
              posts.find((p) => p.userId === userId)?.author.userName
            }`
      );
    } catch (error) {
      console.error("Failed to follow/unfollow user:", error);
      message.error("Failed to update follow status");

      // Rollback on error
      setUserInteractions((prev) => {
        const newFollowing = new Set(prev.following);
        if (isCurrentlyFollowing) {
          newFollowing.add(userId);
        } else {
          newFollowing.delete(userId);
        }
        return { ...prev, following: newFollowing };
      });

      // Rollback follower count
      setPosts((prev) =>
        prev.map((post) =>
          post.userId === userId
            ? {
                ...post,
                author: {
                  ...post.author,
                  followers: isCurrentlyFollowing
                    ? (post.author.followers || 0) + 1
                    : (post.author.followers || 0) - 1,
                },
              }
            : post
        )
      );
    }
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
      {hasNewPosts && scrolledDown && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-slideDown">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleLoadNewPosts}
            size="large"
            className="bg-[#00623B] dark:bg-[#00a862] shadow-lg">
            Load New Posts
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            author={post.author}
            currentUserId={currentUser?.id}
            onLike={handleLike}
            onDislike={handleDislike}
            onComment={handleComment}
            onBookmark={handleBookmark}
            onShare={handleShare}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onFollow={handleFollow}
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
            onSubmit={handleUpdatePost}
            editMode={true}
            postToEdit={postToEdit}
          />
        </Suspense>
      )}

      {/* Comment Section Modal */}
      {selectedPostId && (
        <CommentSection
          open={commentModalOpen}
          onClose={() => {
            setCommentModalOpen(false);
            setSelectedPostId(null);
            setComments([]);
          }}
          postId={selectedPostId}
          comments={comments}
          currentUser={currentUser}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </>
  );
}

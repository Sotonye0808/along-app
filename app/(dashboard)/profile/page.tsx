"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Spin, App, Skeleton, Card } from "antd";
import { UserProfile } from "@/components/features/profile";
const EditProfileModal = lazy(() =>
  import("@/components/features/profile/EditProfileModal").then((mod) => ({
    default: mod.EditProfileModal,
  }))
);
const ShareRouteModal = lazy(() =>
  import("@/components/features/posts/ShareRouteModal").then((mod) => ({
    default: mod.ShareRouteModal,
  }))
);
import { useAuth } from "../../providers/AuthProvider";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface PostWithAuthor extends Post {
  author: User;
}

interface CommentWithAuthorAndPost extends PostComment {
  author: User;
  post: Post;
}

export default function ProfilePage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [comments, setComments] = useState<CommentWithAuthorAndPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [userInteractions, setUserInteractions] = useState({
    likes: new Set<string>(),
    dislikes: new Set<string>(),
    bookmarks: new Set<string>(),
  });
  const { message } = App.useApp();

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
      fetchUserPosts();
      fetchUserComments();
      fetchUserInteractions();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    if (!currentUser) return;

    try {
      const response = await api.get<User>(
        `${API_ENDPOINTS.USERS}/${currentUser.id}`
      );
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!currentUser) return;

    try {
      // Fetch all posts and filter by user
      const postsResponse = await api.get<Post[]>(API_ENDPOINTS.POSTS);
      const userPosts = (postsResponse.data || []).filter(
        (post) => post.userId === currentUser.id
      );

      // Fetch users to attach author info
      const usersResponse = await api.get<User[]>(API_ENDPOINTS.USERS);
      const usersData = usersResponse.data;

      const postsWithAuthors = userPosts.map((post) => ({
        ...post,
        author:
          usersData.find((u) => u.id === post.userId) ||
          ({
            id: currentUser.id,
            userName: currentUser.userName,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            createdAt: new Date().toISOString(),
          } as User),
      }));

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    }
  };

  const fetchUserComments = async () => {
    if (!currentUser) return;

    try {
      // Fetch all posts to get comments
      const postsResponse = await api.get<Post[]>(API_ENDPOINTS.POSTS);
      const allPosts = postsResponse.data;

      // Fetch all users
      const usersResponse = await api.get<User[]>(API_ENDPOINTS.USERS);
      const usersData = usersResponse.data;

      const userComments: CommentWithAuthorAndPost[] = [];

      // Get comments from each post
      for (const post of allPosts) {
        try {
          const commentsResponse = await api.get<PostComment[]>(
            API_ENDPOINTS.POST_COMMENTS(post.id)
          );

          const postComments = commentsResponse.data
            .filter((comment) => comment.userId === currentUser.id)
            .map((comment) => ({
              ...comment,
              author:
                usersData.find((u) => u.id === comment.userId) ||
                ({
                  id: currentUser.id,
                  userName: currentUser.userName,
                  firstName: currentUser.firstName,
                  lastName: currentUser.lastName,
                  email: currentUser.email,
                  createdAt: new Date().toISOString(),
                } as User),
              post,
            }));

          userComments.push(...postComments);
        } catch (error) {
          console.error(`Failed to fetch comments for post ${post.id}:`, error);
        }
      }

      setComments(userComments);
    } catch (error) {
      console.error("Failed to fetch user comments:", error);
    }
  };

  const fetchUserInteractions = async () => {
    if (!currentUser) return;

    try {
      const postsResponse = await api.get<Post[]>(API_ENDPOINTS.POSTS);
      const likes = new Set<string>();
      const dislikes = new Set<string>();
      const bookmarks = new Set<string>();

      for (const post of postsResponse.data) {
        try {
          // Check likes/dislikes
          const likeCheck = await api.get<Like | null>(
            `${API_ENDPOINTS.POST_LIKE(post.id)}?userId=${currentUser.id}`
          );

          if (likeCheck.data) {
            if (likeCheck.data.type === "like") {
              likes.add(post.id);
            } else if (likeCheck.data.type === "dislike") {
              dislikes.add(post.id);
            }
          }

          // Check bookmarks
          const bookmarkCheck = await api.get<Bookmark | null>(
            `${API_ENDPOINTS.POST_BOOKMARK(post.id)}?userId=${currentUser.id}`
          );

          if (bookmarkCheck.data) {
            bookmarks.add(post.id);
          }
        } catch (error) {
          console.error(
            `Failed to check interactions for post ${post.id}:`,
            error
          );
        }
      }

      setUserInteractions({ likes, dislikes, bookmarks });
    } catch (error) {
      console.error("Failed to fetch user interactions:", error);
    }
  };

  const handleUpdateProfile = async (userData: Partial<User>) => {
    if (!currentUser) return;

    try {
      await api.put(`${API_ENDPOINTS.USERS}/${currentUser.id}`, userData);

      // Update local state
      setUser((prev) => (prev ? { ...prev, ...userData } : null));

      // Refresh user data
      await fetchUserProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
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
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        )
      );
    } else {
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
        await api.delete(`${API_ENDPOINTS.POST_LIKE(postId)}`, {
          data: { userId: currentUser.id },
        });
        message.success("Like removed");
      } else {
        await api.post(`${API_ENDPOINTS.POST_LIKE(postId)}`, {
          userId: currentUser.id,
          type: "like",
        });
        message.success("Post liked");
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      message.error("Failed to update like");
      // Rollback
      await fetchUserPosts();
      await fetchUserInteractions();
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
      newDislikes.delete(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, dislikes: post.dislikes - 1 } : post
        )
      );
    } else {
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
        await api.delete(`${API_ENDPOINTS.POST_LIKE(postId)}`, {
          data: { userId: currentUser.id },
        });
        message.success("Dislike removed");
      } else {
        await api.post(`${API_ENDPOINTS.POST_LIKE(postId)}`, {
          userId: currentUser.id,
          type: "dislike",
        });
        message.success("Post disliked");
      }
    } catch (error) {
      console.error("Failed to dislike post:", error);
      message.error("Failed to update dislike");
      // Rollback
      await fetchUserPosts();
      await fetchUserInteractions();
    }
  };

  const handleComment = (postId: string) => {
    message.info("Comment section - to be enhanced with modal");
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
      newBookmarks.delete(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, bookmarks: (post.bookmarks || 1) - 1 }
            : post
        )
      );
    } else {
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
        await api.delete(`${API_ENDPOINTS.POST_BOOKMARK(postId)}`, {
          data: { userId: currentUser.id },
        });
        message.success("Removed from bookmarks");
      } else {
        await api.post(`${API_ENDPOINTS.POST_BOOKMARK(postId)}`, {
          userId: currentUser.id,
        });
        message.success("Added to bookmarks");
      }
    } catch (error) {
      console.error("Failed to bookmark post:", error);
      message.error("Failed to update bookmark");
      // Rollback
      await fetchUserPosts();
      await fetchUserInteractions();
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

  const handleEdit = (post: Post) => {
    setPostToEdit(post);
    setEditPostModalOpen(true);
  };

  const handleUpdatePost = async (postData: Partial<Post>) => {
    if (!postData.id) return;

    try {
      await api.put(`${API_ENDPOINTS.POSTS}/${postData.id}`, postData);

      // Update the post in the local state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postData.id ? ({ ...p, ...postData } as PostWithAuthor) : p
        )
      );

      message.success("Post updated successfully!");
      setEditPostModalOpen(false);
      setPostToEdit(null);
    } catch (error) {
      console.error("Failed to update post:", error);
      message.error("Failed to update post");
      throw error;
    }
  };

  const handleLikeComment = async (commentId: string) => {
    // TODO: Implement comment like/dislike tracking
    message.info("Comment interaction - to be implemented with backend");
  };

  const handleDislikeComment = async (commentId: string) => {
    message.info("Comment interaction - to be implemented with backend");
  };

  const handleEditComment = async (commentId: string, newText: string) => {
    try {
      // Find the comment's post
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      await api.put(
        `${API_ENDPOINTS.POST_COMMENTS(comment.postId)}/${commentId}`,
        {
          text: newText,
        }
      );

      // Update local state
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, text: newText } : c))
      );
    } catch (error) {
      console.error("Failed to update comment:", error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      await api.delete(
        `${API_ENDPOINTS.POST_COMMENTS(comment.postId)}/${commentId}`
      );

      // Update local state
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  };

  const handleDelete = async (postId: string) => {
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
        duration: 0.1,
        btn: (
          <button
            className="px-3 py-1 bg-[#00623B] text-white rounded hover:bg-[#004d2e] text-sm"
            onClick={() => {
              undoClicked = true;
              notification.destroy(key);
              message.info("Deletion cancelled");
            }}>
            Undo
          </button>
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
              setPosts((prev) => prev.filter((p) => p.id !== postId));
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
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        </Card>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-500 dark:text-gray-400">
          Please login to view your profile
        </p>
      </div>
    );
  }

  return (
    <>
      <UserProfile
        user={user}
        isOwnProfile={true}
        posts={posts}
        comments={comments}
        currentUserId={currentUser.id}
        isAuthenticated={isAuthenticated}
        onEditProfile={() => setEditModalOpen(true)}
        userInteractions={userInteractions}
        onLike={handleLike}
        onDislike={handleDislike}
        onComment={handleComment}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLikeComment={handleLikeComment}
        onDislikeComment={handleDislikeComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
      />

      {editModalOpen && (
        <Suspense fallback={<Spin size="large" fullscreen />}>
          <EditProfileModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            user={user}
            onSave={handleUpdateProfile}
            isAuthenticated={true}
          />
        </Suspense>
      )}

      {postToEdit && (
        <Suspense fallback={<Spin size="large" fullscreen />}>
          <ShareRouteModal
            open={editPostModalOpen}
            onClose={() => {
              setEditPostModalOpen(false);
              setPostToEdit(null);
            }}
            onSubmit={handleUpdatePost}
            editMode={true}
            postToEdit={postToEdit}
          />
        </Suspense>
      )}
    </>
  );
}

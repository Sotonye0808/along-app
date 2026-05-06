"use client";

import React, { useState, useEffect } from "react";
import { Spin, App } from "antd";
import { useRouter, useParams } from "next/navigation";
import { UserProfile, EditProfileModal } from "@/components/features/profile";
import { ShareRouteModal } from "@/components/features/posts/ShareRouteModal";
import { useAuth } from "../../../providers/AuthProvider";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { StructuredData } from "@/components/ui/StructuredData";
import { generatePersonSchema } from "@/lib/utils/structuredData";
import { getSiteUrl } from "@/lib/utils/metadata";

interface PostWithAuthor extends Post {
  author: User;
}

interface CommentWithAuthorAndPost extends PostComment {
  author: User;
  post: Post;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [comments, setComments] = useState<CommentWithAuthorAndPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [userInteractions, setUserInteractions] = useState({
    likes: new Set<string>(),
    dislikes: new Set<string>(),
    bookmarks: new Set<string>(),
  });
  const { message, notification } = App.useApp();
  const router = useRouter();

  const isOwnProfile = currentUser?.userName === username;

  useEffect(() => {
    if (username) {
      fetchUserProfile();
      fetchUserPosts();
      fetchUserComments();
      if (currentUser) {
        fetchUserInteractions();
      }
    }
  }, [username, currentUser]);

  const fetchUserProfile = async () => {
    try {
      // Find user by username
      const usersResponse = await api.get<User[]>(API_ENDPOINTS.USERS);
      const foundUser = (usersResponse.data || []).find(
        (u) => u.userName === username,
      );

      if (!foundUser) {
        message.error("User not found");
        router.push("/home");
        return;
      }

      setUser(foundUser);

      // Check if current user is following this user
      if (currentUser && foundUser.id !== currentUser.id) {
        const isFollowingUser = currentUser.following?.includes(foundUser.id);
        setIsFollowing(!!isFollowingUser);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      message.error("Failed to load profile");
      router.push("/home");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      // Fetch all posts and filter by username
      const postsResponse = await api.get<Post[]>(API_ENDPOINTS.POSTS);
      const usersResponse = await api.get<User[]>(API_ENDPOINTS.USERS);

      const targetUser = (usersResponse.data || []).find(
        (u) => u.userName === username,
      );
      if (!targetUser) return;

      const userPosts = (postsResponse.data || []).filter(
        (post) => post.userId === targetUser.id,
      );

      const usersData = usersResponse.data;
      const postsWithAuthors = userPosts.map((post) => ({
        ...post,
        author:
          usersData.find((u) => u.id === post.userId) ||
          ({
            id: targetUser.id,
            userName: targetUser.userName,
            firstName: targetUser.firstName,
            lastName: targetUser.lastName,
            email: targetUser.email,
            createdAt: new Date().toISOString(),
          } as User),
      }));

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    }
  };

  const fetchUserComments = async () => {
    try {
      const postsResponse = await api.get<Post[]>(API_ENDPOINTS.POSTS);
      const allPosts = postsResponse.data;

      const usersResponse = await api.get<User[]>(API_ENDPOINTS.USERS);
      const usersData = usersResponse.data;

      const targetUser = usersData.find((u) => u.userName === username);
      if (!targetUser) return;

      const userComments: CommentWithAuthorAndPost[] = [];

      for (const post of allPosts) {
        try {
          const commentsResponse = await api.get<PostComment[]>(
            API_ENDPOINTS.POST_COMMENTS(post.id),
          );

          const postComments = commentsResponse.data
            .filter((comment) => comment.userId === targetUser.id)
            .map((comment) => ({
              ...comment,
              author:
                usersData.find((u) => u.id === comment.userId) ||
                ({
                  id: targetUser.id,
                  userName: targetUser.userName,
                  firstName: targetUser.firstName,
                  lastName: targetUser.lastName,
                  email: targetUser.email,
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
          const likeCheck = await api.get<Like | null>(
            `${API_ENDPOINTS.POST_LIKE(post.id)}?userId=${currentUser.id}`,
          );

          if (likeCheck.data) {
            if (likeCheck.data.type === "like") {
              likes.add(post.id);
            } else if (likeCheck.data.type === "dislike") {
              dislikes.add(post.id);
            }
          }

          const bookmarkCheck = await api.get<Bookmark | null>(
            `${API_ENDPOINTS.POST_BOOKMARK(post.id)}?userId=${currentUser.id}`,
          );

          if (bookmarkCheck.data) {
            bookmarks.add(post.id);
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

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;

    try {
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);

      // Optimistically update follower count
      setUser((prev) =>
        prev
          ? {
              ...prev,
              followers: newFollowingState
                ? (prev.followers || 0) + 1
                : (prev.followers || 1) - 1,
            }
          : null,
      );

      await api.post(API_ENDPOINTS.USER_FOLLOW(userId), {
        userId: currentUser.id,
        action: newFollowingState ? "follow" : "unfollow",
      });

      message.success(
        newFollowingState
          ? `You are now following ${user?.firstName}`
          : `You unfollowed ${user?.firstName}`,
      );
    } catch (error) {
      console.error("Failed to follow/unfollow user:", error);
      message.error("Failed to update follow status");
      // Rollback
      setIsFollowing(!isFollowing);
      await fetchUserProfile();
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      message.warning("Please login to like posts");
      return;
    }

    const wasLiked = userInteractions.likes.has(postId);
    const wasDisliked = userInteractions.dislikes.has(postId);

    const newLikes = new Set(userInteractions.likes);
    const newDislikes = new Set(userInteractions.dislikes);

    if (wasLiked) {
      newLikes.delete(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post,
        ),
      );
    } else {
      newLikes.add(postId);
      if (wasDisliked) {
        newDislikes.delete(postId);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, likes: post.likes + 1, dislikes: post.dislikes - 1 }
              : post,
          ),
        );
      } else {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post,
          ),
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
      } else {
        await api.post(`${API_ENDPOINTS.POST_LIKE(postId)}`, {
          userId: currentUser.id,
          type: "like",
        });
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      message.error("Failed to update like");
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

    const newLikes = new Set(userInteractions.likes);
    const newDislikes = new Set(userInteractions.dislikes);

    if (wasDisliked) {
      newDislikes.delete(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, dislikes: post.dislikes - 1 } : post,
        ),
      );
    } else {
      newDislikes.add(postId);
      if (wasLiked) {
        newLikes.delete(postId);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, dislikes: post.dislikes + 1, likes: post.likes - 1 }
              : post,
          ),
        );
      } else {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, dislikes: post.dislikes + 1 }
              : post,
          ),
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
      } else {
        await api.post(`${API_ENDPOINTS.POST_LIKE(postId)}`, {
          userId: currentUser.id,
          type: "dislike",
        });
      }
    } catch (error) {
      console.error("Failed to dislike post:", error);
      message.error("Failed to update dislike");
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
    const newBookmarks = new Set(userInteractions.bookmarks);

    if (wasBookmarked) {
      newBookmarks.delete(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, bookmarks: (post.bookmarks || 1) - 1 }
            : post,
        ),
      );
    } else {
      newBookmarks.add(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, bookmarks: (post.bookmarks || 0) + 1 }
            : post,
        ),
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
          p.id === postData.id ? ({ ...p, ...postData } as PostWithAuthor) : p,
        ),
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

  const handleDelete = async (postId: string) => {
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const personSchema = generatePersonSchema(user, getSiteUrl());

  return (
    <>
      <StructuredData data={personSchema} />

      <UserProfile
        user={user}
        isOwnProfile={isOwnProfile}
        posts={posts}
        comments={comments}
        currentUserId={currentUser?.id}
        isAuthenticated={isAuthenticated}
        onFollow={handleFollow}
        isFollowing={isFollowing}
        userInteractions={userInteractions}
        onLike={handleLike}
        onDislike={handleDislike}
        onComment={handleComment}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {postToEdit && (
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
      )}
    </>
  );
}

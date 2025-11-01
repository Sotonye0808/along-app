"use client";

import React, { useState, useEffect } from "react";
import { Spin, App } from "antd";
import { UserProfile, EditProfileModal } from "@/components/features/profile";
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
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [comments, setComments] = useState<CommentWithAuthorAndPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
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
      const userPosts = postsResponse.data.filter(
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
    // Implement like handler (similar to Feed component)
    message.info("Like functionality - integrate with Feed component");
  };

  const handleDislike = async (postId: string) => {
    // Implement dislike handler
    message.info("Dislike functionality - integrate with Feed component");
  };

  const handleComment = (postId: string) => {
    // Implement comment handler
    message.info("Comment functionality - integrate with Feed component");
  };

  const handleBookmark = async (postId: string) => {
    // Implement bookmark handler
    message.info("Bookmark functionality - integrate with Feed component");
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
    // Navigate to edit or open edit modal
    message.info("Edit functionality - to be implemented");
  };

  const handleDelete = async (postId: string) => {
    try {
      await api.delete(`${API_ENDPOINTS.POSTS}/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      message.success("Post deleted successfully!");
    } catch (error) {
      console.error("Failed to delete post:", error);
      message.error("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!user || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-500">Please login to view your profile</p>
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
        onEditProfile={() => setEditModalOpen(true)}
        userInteractions={userInteractions}
        onLike={handleLike}
        onDislike={handleDislike}
        onComment={handleComment}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onSave={handleUpdateProfile}
        isAuthenticated={true}
      />
    </>
  );
}

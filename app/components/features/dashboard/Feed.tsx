"use client";

import React, { useState, useEffect } from "react";
import { Empty, Spin, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { PostCard } from "@/components/features/posts/PostCard";
import { CommentSection } from "@/components/features/posts/CommentSection";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface PostWithAuthor extends Post {
  author: User;
}

export function Feed() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<(PostComment & { author: User })[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.post(`${API_ENDPOINTS.POST_LIKE(postId)}`);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleDislike = async (postId: string) => {
    try {
      await api.post(`${API_ENDPOINTS.POST_DISLIKE(postId)}`);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, dislikes: post.dislikes + 1 } : post
        )
      );
    } catch (error) {
      console.error("Failed to dislike post:", error);
    }
  };

  const handleComment = async (postId: string) => {
    setSelectedPostId(postId);

    try {
      // Fetch comments for this post
      const commentsResponse = await api.get<PostComment[]>(API_ENDPOINTS.COMMENTS);
      const allComments = commentsResponse.data;
      const postComments = allComments.filter((c) => c.postId === postId);

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
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    try {
      const newComment: Partial<PostComment> = {
        postId,
        userId: "1", // Current user ID - replace with actual user
        text,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
      };

      await api.post(API_ENDPOINTS.COMMENTS, newComment);

      // Refresh comments
      handleComment(postId);

      // Update comment count
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: post.comments + 1 } : post
        )
      );
    } catch (error) {
      console.error("Failed to add comment:", error);
      throw error;
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      await api.post(`${API_ENDPOINTS.POST_BOOKMARK(postId)}`);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, bookmarks: (post.bookmarks || 0) + 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to bookmark post:", error);
    }
  };

  const handleShare = (postId: string) => {
    // Implement share functionality
    console.log("Share post:", postId);
    if (navigator.share) {
      navigator.share({
        title: "Check out this route on Along",
        url: `${window.location.origin}/posts/${postId}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
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
          className="mt-4">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            author={post.author}
            onLike={handleLike}
            onDislike={handleDislike}
            onComment={handleComment}
            onBookmark={handleBookmark}
            onShare={handleShare}
          />
        ))}
      </div>

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
          currentUser={{
            id: "1",
            userName: "johndoe",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            createdAt: new Date().toISOString(),
          }}
          onAddComment={handleAddComment}
        />
      )}
    </>
  );
}

import { useState, useCallback } from "react";
import { App } from "antd";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { combinePostsWithAuthors } from "@/lib/utils/feedHelpers";

interface PostWithAuthor extends Post {
    author: User;
}

export function useFeedPosts() {
    const [posts, setPosts] = useState<PostWithAuthor[]>([]);
    const [loading, setLoading] = useState(true);
    const { message } = App.useApp();

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch posts
            const postsResponse = await api.get<Post[]>(API_ENDPOINTS.POSTS);
            const postsData = postsResponse.data || [];

            // Fetch users
            const usersResponse = await api.get<User[]>(API_ENDPOINTS.USERS);
            const usersData = usersResponse.data || [];

            // Combine posts with authors
            const postsWithAuthors = combinePostsWithAuthors(postsData, usersData);

            setPosts(postsWithAuthors);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            message.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    }, [message]);

    const checkForNewPosts = useCallback(async (currentPostCount: number): Promise<boolean> => {
        try {
            const response = await api.get<Post[]>(API_ENDPOINTS.POSTS);
            return (response.data || []).length > currentPostCount;
        } catch (error) {
            console.error("Failed to check for new posts:", error);
            return false;
        }
    }, []);

    const updatePostLikes = useCallback((postId: string, increment: number) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId ? { ...post, likes: post.likes + increment } : post
            )
        );
    }, []);

    const updatePostDislikes = useCallback((postId: string, increment: number) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId ? { ...post, dislikes: post.dislikes + increment } : post
            )
        );
    }, []);

    const updatePostComments = useCallback((postId: string, increment: number) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId ? { ...post, comments: post.comments + increment } : post
            )
        );
    }, []);

    const updatePostBookmarks = useCallback((postId: string, increment: number) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? { ...post, bookmarks: (post.bookmarks || 0) + increment }
                    : post
            )
        );
    }, []);

    const updateAuthorFollowers = useCallback((userId: string, increment: number) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.userId === userId
                    ? {
                        ...post,
                        author: {
                            ...post.author,
                            followers: (post.author.followers || 0) + increment,
                        },
                    }
                    : post
            )
        );
    }, []);

    const deletePost = useCallback((postId: string) => {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
    }, []);

    const updatePost = useCallback(async (postId: string, postData: Partial<Post>) => {
        try {
            await api.put(API_ENDPOINTS.POST_BY_ID(postId), postData);
            await fetchPosts();
            message.success("Post updated successfully");
        } catch (error) {
            console.error("Failed to update post:", error);
            message.error("Failed to update post");
            throw error;
        }
    }, [fetchPosts, message]);

    return {
        posts,
        loading,
        fetchPosts,
        checkForNewPosts,
        updatePostLikes,
        updatePostDislikes,
        updatePostComments,
        updatePostBookmarks,
        updateAuthorFollowers,
        deletePost,
        updatePost,
    };
}

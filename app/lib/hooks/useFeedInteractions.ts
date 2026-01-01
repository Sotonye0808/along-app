import { useState, useCallback, useEffect } from "react";
import { App } from "antd";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface UserInteractions {
    likes: Set<string>;
    dislikes: Set<string>;
    bookmarks: Set<string>;
    following: Set<string>;
}

export function useFeedInteractions(currentUser: User | null) {
    const [userInteractions, setUserInteractions] = useState<UserInteractions>({
        likes: new Set(),
        dislikes: new Set(),
        bookmarks: new Set(),
        following: new Set(),
    });
    const { message } = App.useApp();

    // Fetch user interactions on mount
    useEffect(() => {
        if (currentUser) {
            fetchUserInteractions();
        }
    }, [currentUser]);

    const fetchUserInteractions = useCallback(async () => {
        if (!currentUser) return;

        try {
            const likes = new Set<string>();
            const dislikes = new Set<string>();
            const bookmarks = new Set<string>();

            // Fetch all posts first
            const postsRes = await api.get<Post[]>(API_ENDPOINTS.POSTS);

            // Check each post for user's interactions
            for (const post of postsRes.data) {
                // Check if user liked this post
                try {
                    const likeRes = await api.get<Like[]>(
                        `${API_ENDPOINTS.POSTS}/${post.id}/likes`
                    );
                    const userLike = likeRes.data.find(
                        (like) => like.userId === currentUser.id && like.type === "like"
                    );
                    if (userLike) likes.add(post.id);
                } catch (error) {
                    console.error(`Failed to fetch likes for post ${post.id}`, error);
                }

                // Check if user disliked this post
                try {
                    const dislikeRes = await api.get<Like[]>(
                        `${API_ENDPOINTS.POSTS}/${post.id}/dislikes`
                    );
                    const userDislike = dislikeRes.data.find(
                        (dislike) =>
                            dislike.userId === currentUser.id && dislike.type === "dislike"
                    );
                    if (userDislike) dislikes.add(post.id);
                } catch (error) {
                    console.error(`Failed to fetch dislikes for post ${post.id}`, error);
                }

                // Check if user bookmarked this post
                try {
                    const bookmarkRes = await api.get<Bookmark[]>(
                        `${API_ENDPOINTS.POSTS}/${post.id}/bookmarks`
                    );
                    const userBookmark = bookmarkRes.data.find(
                        (bookmark) => bookmark.userId === currentUser.id
                    );
                    if (userBookmark) bookmarks.add(post.id);
                } catch (error) {
                    console.error(
                        `Failed to fetch bookmarks for post ${post.id}`,
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
    }, [currentUser]);

    const fetchUserFollowing = useCallback(async () => {
        if (!currentUser) return;

        try {
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
    }, [currentUser]);

    const handleLike = useCallback(
        async (
            postId: string,
            updatePostLikes: (postId: string, increment: number) => void,
            updatePostDislikes: (postId: string, increment: number) => void,
            refetchPosts: () => Promise<void>
        ) => {
            if (!currentUser) {
                message.warning("Please login to like posts");
                return;
            }

            const wasLiked = userInteractions.likes.has(postId);
            const wasDisliked = userInteractions.dislikes.has(postId);

            // Store previous state for rollback
            const previousInteractions = { ...userInteractions };

            // Optimistic update
            const newLikes = new Set(userInteractions.likes);
            const newDislikes = new Set(userInteractions.dislikes);

            if (wasLiked) {
                newLikes.delete(postId);
                updatePostLikes(postId, -1);
            } else {
                newLikes.add(postId);
                if (wasDisliked) {
                    newDislikes.delete(postId);
                    updatePostLikes(postId, 1);
                    updatePostDislikes(postId, -1);
                } else {
                    updatePostLikes(postId, 1);
                }
            }

            setUserInteractions({
                ...userInteractions,
                likes: newLikes,
                dislikes: newDislikes,
            });

            try {
                if (wasLiked) {
                    await api.delete(`${API_ENDPOINTS.POSTS}/${postId}/likes`, {
                        data: { userId: currentUser.id },
                    });
                } else {
                    await api.post(`${API_ENDPOINTS.POSTS}/${postId}/likes`, {
                        userId: currentUser.id,
                    });
                }
            } catch (error) {
                console.error("Failed to like post:", error);
                message.error("Failed to update like");
                setUserInteractions(previousInteractions);
                await refetchPosts();
            }
        },
        [currentUser, userInteractions, message]
    );

    const handleDislike = useCallback(
        async (
            postId: string,
            updatePostLikes: (postId: string, increment: number) => void,
            updatePostDislikes: (postId: string, increment: number) => void,
            refetchPosts: () => Promise<void>
        ) => {
            if (!currentUser) {
                message.warning("Please login to dislike posts");
                return;
            }

            const wasDisliked = userInteractions.dislikes.has(postId);
            const wasLiked = userInteractions.likes.has(postId);

            // Store previous state for rollback
            const previousInteractions = { ...userInteractions };

            // Optimistic update
            const newLikes = new Set(userInteractions.likes);
            const newDislikes = new Set(userInteractions.dislikes);

            if (wasDisliked) {
                newDislikes.delete(postId);
                updatePostDislikes(postId, -1);
            } else {
                newDislikes.add(postId);
                if (wasLiked) {
                    newLikes.delete(postId);
                    updatePostDislikes(postId, 1);
                    updatePostLikes(postId, -1);
                } else {
                    updatePostDislikes(postId, 1);
                }
            }

            setUserInteractions({
                ...userInteractions,
                likes: newLikes,
                dislikes: newDislikes,
            });

            try {
                if (wasDisliked) {
                    await api.delete(`${API_ENDPOINTS.POSTS}/${postId}/dislikes`, {
                        data: { userId: currentUser.id },
                    });
                } else {
                    await api.post(`${API_ENDPOINTS.POSTS}/${postId}/dislikes`, {
                        userId: currentUser.id,
                    });
                }
            } catch (error) {
                console.error("Failed to dislike post:", error);
                message.error("Failed to update dislike");
                setUserInteractions(previousInteractions);
                await refetchPosts();
            }
        },
        [currentUser, userInteractions, message]
    );

    const handleBookmark = useCallback(
        async (
            postId: string,
            updatePostBookmarks: (postId: string, increment: number) => void,
            refetchPosts: () => Promise<void>
        ) => {
            if (!currentUser) {
                message.warning("Please login to bookmark posts");
                return;
            }

            const wasBookmarked = userInteractions.bookmarks.has(postId);

            // Store previous state for rollback
            const previousInteractions = { ...userInteractions };

            // Optimistic update
            const newBookmarks = new Set(userInteractions.bookmarks);

            if (wasBookmarked) {
                newBookmarks.delete(postId);
                updatePostBookmarks(postId, -1);
                message.success("Removed from bookmarks");
            } else {
                newBookmarks.add(postId);
                updatePostBookmarks(postId, 1);
                message.success("Added to bookmarks");
            }

            setUserInteractions({
                ...userInteractions,
                bookmarks: newBookmarks,
            });

            try {
                if (wasBookmarked) {
                    await api.delete(`${API_ENDPOINTS.POSTS}/${postId}/bookmarks`, {
                        data: { userId: currentUser.id },
                    });
                } else {
                    await api.post(`${API_ENDPOINTS.POSTS}/${postId}/bookmarks`, {
                        userId: currentUser.id,
                    });
                }
            } catch (error) {
                console.error("Failed to bookmark post:", error);
                message.error("Failed to update bookmark");
                setUserInteractions(previousInteractions);
                await refetchPosts();
            }
        },
        [currentUser, userInteractions, message]
    );

    const handleFollow = useCallback(
        async (
            userId: string,
            updateAuthorFollowers: (userId: string, increment: number) => void,
            refetchFollowing: () => Promise<void>
        ) => {
            if (!currentUser) {
                message.warning("Please login to follow users");
                return;
            }

            const isCurrentlyFollowing = userInteractions.following.has(userId);
            const previousFollowing = new Set(userInteractions.following);

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

            updateAuthorFollowers(userId, isCurrentlyFollowing ? -1 : 1);

            try {
                const userResponse = await api.get<User>(
                    API_ENDPOINTS.USER_BY_ID(currentUser.id)
                );
                const currentFollowing = userResponse.data.following || [];

                const updatedFollowing = isCurrentlyFollowing
                    ? currentFollowing.filter((id) => id !== userId)
                    : [...currentFollowing, userId];

                await api.put(API_ENDPOINTS.USER_BY_ID(currentUser.id), {
                    following: updatedFollowing,
                });

                message.success(
                    isCurrentlyFollowing ? "Unfollowed user" : "Following user"
                );

                // Refetch to sync state
                await fetchUserFollowing();
            } catch (error) {
                console.error("Failed to follow/unfollow user:", error);
                message.error("Failed to update follow status");

                // Rollback to exact previous state
                setUserInteractions((prev) => ({
                    ...prev,
                    following: previousFollowing,
                }));

                updateAuthorFollowers(userId, isCurrentlyFollowing ? 1 : -1);
            }
        },
        [currentUser, userInteractions, message, fetchUserFollowing]
    );

    return {
        userInteractions,
        handleLike,
        handleDislike,
        handleBookmark,
        handleFollow,
    };
}

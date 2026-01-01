import { useState, useCallback } from "react";
import { App } from "antd";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { combineCommentsWithAuthors } from "@/lib/utils/feedHelpers";

export function useComments(currentUser: User | null) {
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<(PostComment & { author: User })[]>([]);
    const { message } = App.useApp();

    const openCommentModal = useCallback(async (postId: string) => {
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

            const commentsWithAuthors = combineCommentsWithAuthors(
                postComments,
                usersData
            );

            setComments(commentsWithAuthors);
            setCommentModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            message.error("Failed to load comments");
        }
    }, [message]);

    const closeCommentModal = useCallback(() => {
        setCommentModalOpen(false);
        setSelectedPostId(null);
        setComments([]);
    }, []);

    const addComment = useCallback(
        async (
            postId: string,
            text: string,
            updatePostComments: (postId: string, increment: number) => void
        ) => {
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
                await openCommentModal(postId);

                // Update comment count
                updatePostComments(postId, 1);

                message.success("Comment added");
            } catch (error) {
                console.error("Failed to add comment:", error);
                message.error("Failed to add comment");
                throw error;
            }
        },
        [currentUser, message, openCommentModal]
    );

    const editComment = useCallback(
        async (commentId: string, newText: string) => {
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
        },
        [currentUser, selectedPostId, message]
    );

    const deleteComment = useCallback(
        async (
            commentId: string,
            updatePostComments: (postId: string, increment: number) => void
        ) => {
            if (!currentUser || !selectedPostId) return;

            try {
                await api.delete(
                    `${API_ENDPOINTS.POST_COMMENTS(selectedPostId)}/${commentId}`
                );

                // Update local state
                setComments((prev) =>
                    prev.filter((comment) => comment.id !== commentId)
                );

                // Update comment count
                updatePostComments(selectedPostId, -1);
            } catch (error) {
                console.error("Failed to delete comment:", error);
                message.error("Failed to delete comment");
            }
        },
        [currentUser, selectedPostId, message]
    );

    const likeComment = useCallback(
        async (commentId: string) => {
            if (!currentUser || !selectedPostId) {
                message.warning("Please login to like comments");
                return;
            }

            const comment = comments.find((c) => c.id === commentId);
            if (!comment) return;

            // Optimistic update
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId ? { ...c, likes: c.likes + 1 } : c
                )
            );

            try {
                await api.post(
                    API_ENDPOINTS.POST_COMMENT_LIKE(selectedPostId, commentId),
                    {
                        userId: currentUser.id,
                        type: "like",
                    }
                );
            } catch (error) {
                console.error("Failed to like comment:", error);
                message.error("Failed to update like");
                // Rollback
                setComments((prev) =>
                    prev.map((c) =>
                        c.id === commentId ? { ...c, likes: c.likes - 1 } : c
                    )
                );
            }
        },
        [currentUser, selectedPostId, comments, message]
    );

    const dislikeComment = useCallback(
        async (commentId: string) => {
            if (!currentUser || !selectedPostId) {
                message.warning("Please login to dislike comments");
                return;
            }

            const comment = comments.find((c) => c.id === commentId);
            if (!comment) return;

            // Optimistic update
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c
                )
            );

            try {
                await api.post(
                    API_ENDPOINTS.POST_COMMENT_DISLIKE(selectedPostId, commentId),
                    {
                        userId: currentUser.id,
                        type: "dislike",
                    }
                );
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
        },
        [currentUser, selectedPostId, comments, message]
    );

    return {
        commentModalOpen,
        selectedPostId,
        comments,
        openCommentModal,
        closeCommentModal,
        addComment,
        editComment,
        deleteComment,
        likeComment,
        dislikeComment,
    };
}

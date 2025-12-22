import { useState, useCallback } from "react";
import { App } from "antd";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Hook for managing comment interactions in profile view
 * Handles comment modal state and comment operations
 */
export function useProfileComments(currentUserId?: string) {
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState<
        (PostComment & { author: User; post: Post }) | null
    >(null);
    const { message } = App.useApp();

    const openCommentModal = useCallback(
        (comment: PostComment & { author: User; post: Post }) => {
            setSelectedComment(comment);
            setCommentModalOpen(true);
        },
        []
    );

    const closeCommentModal = useCallback(() => {
        setCommentModalOpen(false);
        setSelectedComment(null);
    }, []);

    const likeComment = useCallback(
        async (commentId: string) => {
            if (!currentUserId) {
                message.warning("Please login to like comments");
                return;
            }

            try {
                // API call for liking comment
                await api.post(`${API_ENDPOINTS.POSTS}/comments/${commentId}/like`, {
                    userId: currentUserId,
                });
                message.success("Comment liked");
            } catch (error) {
                console.error("Failed to like comment:", error);
                message.error("Failed to like comment");
            }
        },
        [currentUserId, message]
    );

    const dislikeComment = useCallback(
        async (commentId: string) => {
            if (!currentUserId) {
                message.warning("Please login to dislike comments");
                return;
            }

            try {
                // API call for disliking comment
                await api.post(`${API_ENDPOINTS.POSTS}/comments/${commentId}/dislike`, {
                    userId: currentUserId,
                });
                message.success("Comment disliked");
            } catch (error) {
                console.error("Failed to dislike comment:", error);
                message.error("Failed to dislike comment");
            }
        },
        [currentUserId, message]
    );

    const editComment = useCallback(
        async (commentId: string, newText: string) => {
            if (!currentUserId) {
                message.warning("Please login to edit comments");
                throw new Error("User not logged in");
            }

            try {
                // Find the post ID from selected comment
                if (!selectedComment) {
                    throw new Error("No comment selected");
                }

                await api.put(
                    `${API_ENDPOINTS.POST_COMMENTS(selectedComment.postId)}/${commentId}`,
                    {
                        text: newText,
                    }
                );
                message.success("Comment updated");
            } catch (error) {
                console.error("Failed to update comment:", error);
                throw error;
            }
        },
        [currentUserId, selectedComment, message]
    );

    const deleteComment = useCallback(
        async (commentId: string) => {
            if (!currentUserId || !selectedComment) {
                message.warning("Please login to delete comments");
                return;
            }

            try {
                await api.delete(
                    `${API_ENDPOINTS.POST_COMMENTS(selectedComment.postId)}/${commentId}`
                );
                message.success("Comment deleted");
            } catch (error) {
                console.error("Failed to delete comment:", error);
                message.error("Failed to delete comment");
            }
        },
        [currentUserId, selectedComment, message]
    );

    return {
        commentModalOpen,
        selectedComment,
        openCommentModal,
        closeCommentModal,
        likeComment,
        dislikeComment,
        editComment,
        deleteComment,
    };
}

/**
 * Hook for handling profile sharing functionality
 */
export function useProfileSharing() {
    const { message } = App.useApp();

    const shareProfile = useCallback(
        (user: User) => {
            const profileUrl = `${window.location.origin}/profile/${user.userName}`;

            if (navigator.share) {
                navigator
                    .share({
                        title: `${user.firstName} ${user.lastName} on Along`,
                        text: `Check out ${user.firstName}'s profile on Along!`,
                        url: profileUrl,
                    })
                    .catch((error) => {
                        if (error.name !== "AbortError") {
                            navigator.clipboard.writeText(profileUrl);
                            message.success("Profile link copied to clipboard!");
                        }
                    });
            } else {
                navigator.clipboard.writeText(profileUrl);
                message.success("Profile link copied to clipboard!");
            }
        },
        [message]
    );

    return { shareProfile };
}

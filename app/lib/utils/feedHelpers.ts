/**
 * Feed Helper Functions
 * Utility functions for the Feed component
 */

/**
 * Get the current user from localStorage
 */
export const getCurrentUser = (): User | null => {
    if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    }
    return null;
};

/**
 * Combine posts with their author information
 */
export const combinePostsWithAuthors = (
    posts: Post[],
    users: User[]
): (Post & { author: User })[] => {
    return posts.map((post) => ({
        ...post,
        author: users.find((user) => user.id === post.userId) || {
            id: post.userId,
            userName: "unknown",
            firstName: "Unknown",
            lastName: "User",
            email: "",
            createdAt: new Date().toISOString(),
        },
    }));
};

/**
 * Combine comments with their author information
 */
export const combineCommentsWithAuthors = (
    comments: PostComment[],
    users: User[]
): (PostComment & { author: User })[] => {
    return comments.map((comment) => ({
        ...comment,
        author: users.find((user) => user.id === comment.userId) || {
            id: comment.userId,
            userName: "unknown",
            firstName: "Unknown",
            lastName: "User",
            email: "",
            createdAt: new Date().toISOString(),
        },
    }));
};

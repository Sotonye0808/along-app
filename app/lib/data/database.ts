// Database Service - Abstract interface for data operations
// This allows seamless switching between mock data and real database

import {
    mockUsers,
    mockPosts,
    mockComments,
    mockLikes,
    mockBookmarks,
    mockNotifications,
} from './mockData';

// In-memory storage for mock data (simulates database)
// In production, these would be actual database calls
class InMemoryStore {
    private users: User[] = [...mockUsers];
    private posts: Post[] = [...mockPosts];
    private comments: PostComment[] = [...mockComments];
    private likes: Like[] = [...mockLikes];
    private bookmarks: Bookmark[] = [...mockBookmarks];
    private notifications: AppNotification[] = [...mockNotifications];

    // Helper to generate unique IDs
    private generateId(prefix: string = ''): string {
        return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Users
    async getUsers(): Promise<User[]> {
        return [...this.users];
    }

    async getUserById(id: string): Promise<User | null> {
        return this.users.find((u) => u.id === id) || null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.users.find((u) => u.email === email) || null;
    }

    async getUserByUserName(userName: string): Promise<User | null> {
        return this.users.find((u) => u.userName === userName) || null;
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const newUser: User = {
            id: this.generateId(),
            userName: userData.userName!,
            firstName: userData.firstName!,
            lastName: userData.lastName!,
            email: userData.email!,
            password: userData.password,
            avatar: userData.avatar,
            bio: userData.bio || '',
            followers: 0,
            following: [],
            likes: [],
            bookmarks: [],
            createdAt: new Date().toISOString(),
            verified: false,
        };
        this.users.push(newUser);
        return newUser;
    }

    async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) return null;
        this.users[index] = { ...this.users[index], ...updates };
        return this.users[index];
    }

    async deleteUser(id: string): Promise<boolean> {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) return false;
        this.users.splice(index, 1);
        return true;
    }

    // Posts
    async getPosts(limit?: number): Promise<Post[]> {
        const posts = [...this.posts].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return limit ? posts.slice(0, limit) : posts;
    }

    async getPostById(id: string): Promise<Post | null> {
        return this.posts.find((p) => p.id === id) || null;
    }

    async getPostsByUserId(userId: string): Promise<Post[]> {
        return this.posts.filter((p) => p.userId === userId);
    }

    async createPost(postData: Partial<Post>): Promise<Post> {
        const newPost: Post = {
            id: this.generateId(),
            userId: postData.userId!,
            title: postData.title!,
            routes: postData.routes || [],
            images: postData.images || [],
            tags: postData.tags || [],
            likes: 0,
            dislikes: 0,
            comments: 0,
            bookmarks: 0,
            validityScore: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.posts.unshift(newPost); // Add to beginning (newest first)
        return newPost;
    }

    async updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
        const index = this.posts.findIndex((p) => p.id === id);
        if (index === -1) return null;
        this.posts[index] = {
            ...this.posts[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        return this.posts[index];
    }

    async deletePost(id: string): Promise<boolean> {
        const index = this.posts.findIndex((p) => p.id === id);
        if (index === -1) return false;
        this.posts.splice(index, 1);
        return true;
    }

    // Comments
    async getCommentsByPostId(postId: string): Promise<PostComment[]> {
        return this.comments.filter((c) => c.postId === postId);
    }

    async createComment(commentData: Partial<PostComment>): Promise<PostComment> {
        const newComment: PostComment = {
            id: this.generateId(),
            postId: commentData.postId!,
            userId: commentData.userId!,
            text: commentData.text!,
            createdAt: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
        };
        this.comments.push(newComment);

        // Update post comment count
        const post = this.posts.find((p) => p.id === commentData.postId);
        if (post) {
            post.comments += 1;
        }

        return newComment;
    }

    async deleteComment(id: string): Promise<boolean> {
        const index = this.comments.findIndex((c) => c.id === id);
        if (index === -1) return false;

        const comment = this.comments[index];
        this.comments.splice(index, 1);

        // Update post comment count
        const post = this.posts.find((p) => p.id === comment.postId);
        if (post && post.comments > 0) {
            post.comments -= 1;
        }

        return true;
    }

    async updateComment(id: string, updates: Partial<PostComment>): Promise<PostComment | null> {
        const index = this.comments.findIndex((c) => c.id === id);
        if (index === -1) return null;
        this.comments[index] = { ...this.comments[index], ...updates };
        return this.comments[index];
    }

    async getCommentById(id: string): Promise<PostComment | null> {
        return this.comments.find((c) => c.id === id) || null;
    }

    async likeComment(commentId: string): Promise<PostComment | null> {
        const comment = this.comments.find((c) => c.id === commentId);
        if (!comment) return null;
        comment.likes += 1;
        return comment;
    }

    async unlikeComment(commentId: string): Promise<PostComment | null> {
        const comment = this.comments.find((c) => c.id === commentId);
        if (!comment || comment.likes === 0) return null;
        comment.likes -= 1;
        return comment;
    }

    async dislikeComment(commentId: string): Promise<PostComment | null> {
        const comment = this.comments.find((c) => c.id === commentId);
        if (!comment) return null;
        comment.dislikes += 1;
        return comment;
    }

    async undislikeComment(commentId: string): Promise<PostComment | null> {
        const comment = this.comments.find((c) => c.id === commentId);
        if (!comment || comment.dislikes === 0) return null;
        comment.dislikes -= 1;
        return comment;
    }

    // Likes
    async getLikesByPostId(postId: string): Promise<Like[]> {
        return this.likes.filter((l) => l.postId === postId);
    }

    async getLike(postId: string, userId: string): Promise<Like | null> {
        return this.likes.find((l) => l.postId === postId && l.userId === userId) || null;
    }

    async createLike(likeData: Partial<Like>): Promise<Like> {
        // Remove existing like/dislike by this user on this post
        this.likes = this.likes.filter(
            (l) => !(l.postId === likeData.postId && l.userId === likeData.userId)
        );

        const newLike: Like = {
            id: this.generateId(),
            postId: likeData.postId!,
            userId: likeData.userId!,
            type: likeData.type!,
        };
        this.likes.push(newLike);

        // Update post like/dislike count
        const post = this.posts.find((p) => p.id === likeData.postId);
        if (post) {
            if (likeData.type === 'like') {
                post.likes += 1;
                // If switching from dislike, decrease dislike count
                const prevLike = this.likes.find(
                    (l) => l.postId === likeData.postId && l.userId === likeData.userId && l.type === 'dislike'
                );
                if (prevLike && post.dislikes > 0) {
                    post.dislikes -= 1;
                }
            } else {
                post.dislikes += 1;
                // If switching from like, decrease like count
                const prevLike = this.likes.find(
                    (l) => l.postId === likeData.postId && l.userId === likeData.userId && l.type === 'like'
                );
                if (prevLike && post.likes > 0) {
                    post.likes -= 1;
                }
            }
        }

        return newLike;
    }

    async deleteLike(postId: string, userId: string): Promise<boolean> {
        const index = this.likes.findIndex((l) => l.postId === postId && l.userId === userId);
        if (index === -1) return false;

        const like = this.likes[index];
        this.likes.splice(index, 1);

        // Update post like/dislike count
        const post = this.posts.find((p) => p.id === postId);
        if (post) {
            if (like.type === 'like' && post.likes > 0) {
                post.likes -= 1;
            } else if (like.type === 'dislike' && post.dislikes > 0) {
                post.dislikes -= 1;
            }
        }

        return true;
    }

    // Bookmarks
    async getBookmarksByUserId(userId: string): Promise<Bookmark[]> {
        return this.bookmarks.filter((b) => b.userId === userId);
    }

    async getBookmark(postId: string, userId: string): Promise<Bookmark | null> {
        return this.bookmarks.find((b) => b.postId === postId && b.userId === userId) || null;
    }

    async createBookmark(bookmarkData: Partial<Bookmark>): Promise<Bookmark> {
        const newBookmark: Bookmark = {
            id: this.generateId(),
            postId: bookmarkData.postId!,
            userId: bookmarkData.userId!,
            createdAt: new Date().toISOString(),
        };
        this.bookmarks.push(newBookmark);

        // Update post bookmark count
        const post = this.posts.find((p) => p.id === bookmarkData.postId);
        if (post) {
            post.bookmarks = (post.bookmarks || 0) + 1;
        }

        return newBookmark;
    }

    async deleteBookmark(postId: string, userId: string): Promise<boolean> {
        const index = this.bookmarks.findIndex((b) => b.postId === postId && b.userId === userId);
        if (index === -1) return false;

        this.bookmarks.splice(index, 1);

        // Update post bookmark count
        const post = this.posts.find((p) => p.id === postId);
        if (post && post.bookmarks && post.bookmarks > 0) {
            post.bookmarks -= 1;
        }

        return true;
    }

    // Notifications
    async getNotificationsByUserId(userId: string): Promise<AppNotification[]> {
        return this.notifications
            .filter((n) => n.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async getNotificationById(id: string): Promise<AppNotification | null> {
        return this.notifications.find((n) => n.id === id) || null;
    }

    async createNotification(notificationData: Partial<AppNotification>): Promise<AppNotification> {
        const newNotification: AppNotification = {
            id: this.generateId(),
            userId: notificationData.userId!,
            type: notificationData.type!,
            message: notificationData.message!,
            postId: notificationData.postId,
            read: false,
            createdAt: new Date().toISOString(),
        };
        this.notifications.push(newNotification);
        return newNotification;
    }

    async updateNotification(id: string, updates: Partial<AppNotification>): Promise<AppNotification | null> {
        const index = this.notifications.findIndex((n) => n.id === id);
        if (index === -1) return null;
        this.notifications[index] = { ...this.notifications[index], ...updates };
        return this.notifications[index];
    }

    async markNotificationAsRead(id: string): Promise<boolean> {
        const notification = this.notifications.find((n) => n.id === id);
        if (!notification) return false;
        notification.read = true;
        return true;
    }

    async markAllNotificationsAsRead(userId: string): Promise<boolean> {
        this.notifications
            .filter((n) => n.userId === userId)
            .forEach((n) => (n.read = true));
        return true;
    }

    async deleteNotification(id: string): Promise<boolean> {
        const index = this.notifications.findIndex((n) => n.id === id);
        if (index === -1) return false;
        this.notifications.splice(index, 1);
        return true;
    }
}

// Singleton instance
let dbInstance: InMemoryStore | null = null;

// Get database instance
export function getDatabase(): InMemoryStore {
    if (!dbInstance) {
        dbInstance = new InMemoryStore();
    }
    return dbInstance;
}

// Export for use in API routes
export const db = getDatabase();

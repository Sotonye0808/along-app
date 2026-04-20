// Core Types
declare global {
    interface User {
        id: string;
        userName: string;
        firstName: string;
        lastName: string;
        email: string;
        password?: string;
        avatar?: string;
        bio?: string;
        followers?: number;
        following?: string[];
        likes?: string[];
        bookmarks?: string[];
        createdAt: string;
        verified?: boolean;
        location?: string;
    }

    interface Link {
        text: string;
        url: string;
    }

    interface Route {
        id: string;
        text: string;
        links: Link[];
        order: number;
        vehicles: VehicleType[];
        status: 'verified' | 'unverified' | 'pending' | 'rejected';
        fare?: number;
    }

    interface Post {
        id: string;
        userId: string;
        title: string;
        routes: Route[];
        images: string[];
        tags: string[];
        likes: number;
        dislikes: number;
        comments: number;
        bookmarks?: number;
        createdAt: string;
        updatedAt: string;
    }

    interface PostComment { // renamed PostComment to prevent conflict with native TS Comment interface
        id: string;
        postId: string;
        userId: string;
        text: string;
        createdAt: string;
        likes: number;
        dislikes: number;
    }

    interface Like {
        id: string;
        postId: string;
        userId: string;
        type: 'like' | 'dislike';
    }

    interface Bookmark {
        id: string;
        postId: string;
        userId: string;
        createdAt: string;
    }

    interface AppNotification { // renamed AppNotification to prevent conflict with native TS Notification interface
        id: string;
        userId: string;
        type: 'like' | 'comment' | 'follow' | 'mention';
        message: string;
        postId?: string;
        read: boolean;
        createdAt: string;
    }

    // API Response Types

    interface ApiResponse<T> {
        data: T;
        message?: string;
        error?: string;
    }

    interface PaginatedResponse<T> {
        data: T[];
        page: number;
        limit: number;
        total: number;
    }

    // Auth Types

    interface LoginCredentials {
        email: string;
        password: string;
    }

    interface RegisterData {
        userName: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }

    interface AuthResponse {
        user: User;
        accessToken: string;
        refreshToken?: string;
    }

    interface OtpVerification {
        email: string;
        code: string;
    }

    interface SearchResult {
      type: "user" | "post" | "tag";
      id: string;
      title: string;
      subtitle?: string;
      avatar?: string;
      link: string;
      metadata?: string;
    }
}

export { }
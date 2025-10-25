// Core Types
declare global {
    interface User {
        id: string;
        userName: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
        bio?: string;
        followers?: number;
        following?: number;
        createdAt: string;
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

    interface Comment {
        id: string;
        postId: string;
        userId: string;
        text: string;
        createdAt: string;
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

    interface Notification {
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
}

export { }
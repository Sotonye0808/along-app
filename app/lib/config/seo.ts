export interface PageMeta {
    title: string;
    description: string;
    path: string;
    noIndex?: boolean;
    keywords?: string[];
}

export interface DefaultMeta {
    siteName: string;
    baseUrl: string;
    defaultImage: string;
    titleTemplate: string;
    twitterHandle: string;
}

export const DEFAULT_META: DefaultMeta = {
    siteName: "Along",
    baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://along.app",
    defaultImage: "/og-image.png",
    titleTemplate: "%s | Along",
    twitterHandle: "@alongapp",
};

export const PAGE_META: Record<string, PageMeta> = {
    landing: {
        title: "Navigate Together",
        description: "Your trusted community-driven transit companion for safer city travel.",
        path: "/",
        keywords: ["routes", "transport", "community", "Along"],
    },
    login: {
        title: "Log In",
        description: "Sign in to continue your journey on Along.",
        path: "/login",
        noIndex: true,
    },
    register: {
        title: "Create Account",
        description: "Join Along and start sharing trusted route intelligence.",
        path: "/register",
        noIndex: true,
    },
    home: {
        title: "Home Feed",
        description: "Live route updates from your transit network.",
        path: "/home",
    },
    explore: {
        title: "Explore Routes",
        description: "Explore transport routes near you.",
        path: "/explore",
    },
    notifications: {
        title: "Notifications",
        description: "Stay updated on route activity, trust milestones, and alerts.",
        path: "/notifications",
    },
    profile: {
        title: "Profile",
        description: "View your trust score, route history, and community impact.",
        path: "/profile",
    },
};

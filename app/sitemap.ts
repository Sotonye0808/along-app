import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/utils/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getSiteUrl();

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/home`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/explore`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/marketplace`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/bookmarks`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/notifications`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/profile`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/analytics`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/events`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/invite`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    const isLocalHost =
        baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

    if (isLocalHost) {
        return staticRoutes;
    }

    try {
        // Fetch all posts for dynamic routes
        const postsResponse = await fetch(`${baseUrl}/api/posts`, {
            next: { revalidate: 3600 },
        });
        const posts = postsResponse.ok ? (await postsResponse.json()) as Post[] : [];

        const postRoutes: MetadataRoute.Sitemap = (posts || []).map((post) => ({
            url: `${baseUrl}/posts/${post.id}`,
            lastModified: new Date(post.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        // Fetch all users for dynamic profile routes
        const usersResponse = await fetch(`${baseUrl}/api/users`, {
            next: { revalidate: 3600 },
        });
        const users = usersResponse.ok ? (await usersResponse.json()) as User[] : [];

        const userRoutes: MetadataRoute.Sitemap = users.map((user) => ({
            url: `${baseUrl}/profile/${user.userName}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));

        return [...staticRoutes, ...postRoutes, ...userRoutes];
    } catch {
        return staticRoutes;
    }
}

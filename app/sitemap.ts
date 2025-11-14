import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
    ];

    try {
        // Fetch all posts for dynamic routes
        const postsResponse = await fetch(`${baseUrl}/api/posts`, {
            cache: 'no-store',
        });
        const posts = postsResponse.ok ? (await postsResponse.json()) as Post[] : [];

        const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
            url: `${baseUrl}/posts/${post.id}`,
            lastModified: new Date(post.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        // Fetch all users for dynamic profile routes
        const usersResponse = await fetch(`${baseUrl}/api/users`, {
            cache: 'no-store',
        });
        const users = usersResponse.ok ? (await usersResponse.json()) as User[] : [];

        const userRoutes: MetadataRoute.Sitemap = users.map((user) => ({
            url: `${baseUrl}/profile/${user.userName}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));

        return [...staticRoutes, ...postRoutes, ...userRoutes];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticRoutes;
    }
}

/**
 * Search Service
 * 
 * Implements multi-category search with intelligent ranking
 * for users, posts, and tags.
 */

import { prisma } from '../db/prisma';
import { cache, CACHE_KEYS, CACHE_TTL } from '../cache/redis';

/**
 * Search across multiple categories
 * @param query - Search query string
 * @param userId - Optional user ID for personalization
 * @param categories - Categories to search (default: all)
 * @returns Categorized search results
 */
export async function searchAll(
    query: string,
    userId?: string,
    categories: ('users' | 'posts' | 'tags')[] = ['users', 'posts', 'tags']
) {
    try {
        const results: any = {};

        const searchPromises = [];

        if (categories.includes('users')) {
            searchPromises.push(
                searchUsers(query, userId).then(users => {
                    results.users = users;
                })
            );
        }

        if (categories.includes('posts')) {
            searchPromises.push(
                searchPosts(query, userId).then(posts => {
                    results.posts = posts;
                })
            );
        }

        if (categories.includes('tags')) {
            searchPromises.push(
                searchTags(query).then(tags => {
                    results.tags = tags;
                })
            );
        }

        await Promise.all(searchPromises);

        return results;
    } catch (error) {
        console.error('Error searching:', error);
        throw error;
    }
}

/**
 * Search users
 * @param query - Search query
 * @param currentUserId - Optional current user ID for context
 * @returns Ranked user results
 */
export async function searchUsers(query: string, currentUserId?: string) {
    try {
        // Check cache
        const cacheKey = CACHE_KEYS.searchResults(query, 'users');
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return cached;
        }

        // Search by username, firstName, or lastName (case-insensitive)
        const searchTerm = query.toLowerCase();

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { userName: { contains: searchTerm, mode: 'insensitive' } },
                    { firstName: { contains: searchTerm, mode: 'insensitive' } },
                    { lastName: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                avatar: true,
                verified: true,
                location: true,
                followers: {
                    select: { id: true }
                }
            },
            take: 20
        });

        // Rank users
        const rankedUsers = users.map((user: any) => {
            let score = 0;

            // Verified users get higher priority
            if (user.verified) {
                score += 100;
            }

            // Follower count
            score += user.followers.length * 0.1;

            // Exact username match gets bonus
            if (user.userName.toLowerCase() === searchTerm) {
                score += 50;
            }

            // Starts with query gets bonus
            if (user.userName.toLowerCase().startsWith(searchTerm) ||
                user.firstName.toLowerCase().startsWith(searchTerm) ||
                user.lastName.toLowerCase().startsWith(searchTerm)) {
                score += 25;
            }

            return {
                ...user,
                followerCount: user.followers.length,
                score
            };
        });

        // Sort by score
        rankedUsers.sort((a: any, b: any) => b.score - a.score);

        // Remove followers array from results
        const results = rankedUsers.map(({ followers, score, ...user }: any) => user);

        // Cache results
        await cache.set(cacheKey, results, CACHE_TTL.search);

        return results;
    } catch (error) {
        console.error('Error searching users:', error);
        throw error;
    }
}

/**
 * Search posts
 * @param query - Search query
 * @param currentUserId - Optional current user ID for personalization
 * @returns Ranked post results
 */
export async function searchPosts(query: string, currentUserId?: string) {
    try {
        // Check cache
        const cacheKey = CACHE_KEYS.searchResults(query, 'posts');
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return cached;
        }

        // Get user location if provided
        let userLocation: string | null = null;
        if (currentUserId) {
            const user = await prisma.user.findUnique({
                where: { id: currentUserId },
                select: { location: true }
            });
            userLocation = user?.location || null;
        }

        // Search in title and tags
        const searchTerm = query.toLowerCase();

        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: searchTerm, mode: 'insensitive' } },
                    { tags: { has: searchTerm } }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        verified: true,
                        location: true
                    }
                }
            },
            take: 50
        });

        // Rank posts
        const rankedPosts = posts.map((post: any) => {
            let score = 0;

            // Title relevance
            if (post.title.toLowerCase().includes(searchTerm)) {
                score += 50;
            }

            // Exact tag match
            if (post.tags.some((tag: string) => tag.toLowerCase() === searchTerm)) {
                score += 40;
            }

            // Location proximity
            if (userLocation && post.user.location === userLocation) {
                score += 30;
            }

            // Engagement (likes, comments, bookmarks)
            const engagementScore = post.likes + (post.comments * 2) + (post.bookmarks * 1.5);
            score += Math.min(engagementScore * 0.1, 50);

            // Recency (newer posts get slight boost)
            const ageInDays = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            if (ageInDays < 7) {
                score += 20 * (1 - ageInDays / 7);
            }

            return {
                ...post,
                score
            };
        });

        // Sort by score
        rankedPosts.sort((a: any, b: any) => b.score - a.score);

        // Take top 20
        const results = rankedPosts.slice(0, 20).map(({ score, ...post }: any) => post);

        // Cache results
        await cache.set(cacheKey, results, CACHE_TTL.search);

        return results;
    } catch (error) {
        console.error('Error searching posts:', error);
        throw error;
    }
}

/**
 * Search tags
 * @param query - Search query
 * @returns Ranked tag results with usage count
 */
export async function searchTags(query: string) {
    try {
        // Check cache
        const cacheKey = CACHE_KEYS.searchResults(query, 'tags');
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return cached;
        }

        const searchTerm = query.toLowerCase();

        // Get all posts with tags matching the query
        const posts = await prisma.post.findMany({
            where: {
                tags: {
                    has: searchTerm
                }
            },
            select: {
                tags: true
            }
        });

        // Count tag frequencies
        const tagCounts: Record<string, number> = {};
        posts.forEach((post: any) => {
            post.tags.forEach((tag: string) => {
                if (tag.toLowerCase().includes(searchTerm)) {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }
            });
        });

        // Sort by frequency
        const results = Object.entries(tagCounts)
            .map(([tag, count]) => ({
                tag,
                count,
                score: count * (tag.toLowerCase() === searchTerm ? 2 : 1)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
            .map(({ tag, count }) => ({ tag, count }));

        // Cache results
        await cache.set(cacheKey, results, CACHE_TTL.search);

        return results;
    } catch (error) {
        console.error('Error searching tags:', error);
        throw error;
    }
}

/**
 * Get popular/trending tags
 * @param limit - Number of tags to return
 * @returns Popular tags with usage count
 */
export async function getPopularTags(limit: number = 20) {
    try {
        // Check cache
        const cacheKey = 'popular:tags';
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return cached;
        }

        // Get posts from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const posts = await prisma.post.findMany({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo
                }
            },
            select: {
                tags: true
            }
        });

        // Count tag frequencies
        const tagCounts: Record<string, number> = {};
        posts.forEach((post: any) => {
            post.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        // Sort by frequency
        const results = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        // Cache results
        await cache.set(cacheKey, results, CACHE_TTL.trending);

        return results;
    } catch (error) {
        console.error('Error getting popular tags:', error);
        throw error;
    }
}

/**
 * Invalidate search cache for a query
 * @param query - Search query
 */
export async function invalidateSearchCache(query: string) {
    try {
        await cache.delPattern(`search:*:${query}`);
    } catch (error) {
        console.error('Error invalidating search cache:', error);
    }
}

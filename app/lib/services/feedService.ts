/**
 * Feed Service
 * 
 * Implements the personalized feed algorithm with intelligent scoring
 * based on user preferences, followed users, and trending content.
 */

import { prisma } from '../db/prisma';
import { cache, CACHE_KEYS, CACHE_TTL } from '../cache/redis';

// Pagination default
const DEFAULT_PAGE_SIZE = 20;

/**
 * Get personalized feed for a user
 * @param userId - User ID requesting the feed
 * @param cursor - Cursor for pagination (post ID)
 * @param limit - Number of posts to return
 * @returns Paginated feed with enriched posts
 */
export async function getPersonalizedFeed(
    userId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_SIZE
) {
    try {
        // Check cache first
        const cacheKey = CACHE_KEYS.userFeed(userId, cursor);
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return cached;
        }

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                location: true,
                following: {
                    select: { followingId: true }
                }
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const followingIds = user.following.map((f: any) => f.followingId);
        const userFavoriteTags = await getUserFavoriteTags(userId);

        // Build scoring query
        const posts = await prisma.post.findMany({
            take: limit + 1, // +1 to check if there are more
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            orderBy: [
                { createdAt: 'desc' }
            ],
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
                },
                _count: {
                    select: {
                        postComments: true,
                        postLikes: true,
                        postBookmarks: true
                    }
                }
            }
        });

        // Score and sort posts
        const scoredPosts = posts.slice(0, limit).map((post: any) => {
            let score = 0;

            // 70% weight: Posts from followed users
            if (followingIds.includes(post.userId)) {
                score += 70;
            }

            // 20% weight: Posts matching user's favorite tags
            const matchingTags = post.tags.filter((tag: string) =>
                userFavoriteTags.includes(tag)
            );
            if (matchingTags.length > 0) {
                score += 20 * (matchingTags.length / Math.max(userFavoriteTags.length, 1));
            }

            // 10% weight: Trending posts (based on engagement)
            const engagementScore = calculateEngagementScore(post);
            score += 10 * Math.min(engagementScore / 100, 1);

            // Bonus: Location proximity
            if (user.location && post.user.location === user.location) {
                score += 15;
            }

            return {
                ...post,
                score
            };
        });

        // Sort by score and then by recency
        scoredPosts.sort((a: any, b: any) => {
            if (Math.abs(a.score - b.score) < 5) {
                // If scores are similar, prefer newer posts
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return b.score - a.score;
        });

        // Enrich posts with user interaction state
        const enrichedPosts = await enrichPostsWithUserState(scoredPosts, userId);

        // Transform to match frontend Post interface
        const transformedPosts = (enrichedPosts || []).map(post => ({
            id: post.id,
            userId: post.userId,
            title: post.title,
            routes: post.routes as unknown as Route[],
            images: post.images,
            tags: post.tags,
            likes: post.likes,
            dislikes: post.dislikes,
            comments: post._count?.postComments || 0,
            bookmarks: post._count?.postBookmarks || 0,
            views: post.views,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            // Include enrichment flags
            isLiked: post.isLiked,
            isDisliked: post.isDisliked,
            isBookmarked: post.isBookmarked,
        }));

        // Determine next cursor
        const hasMore = posts.length > limit;
        const nextCursor = hasMore ? posts[limit - 1].id : null;

        const result = {
            data: transformedPosts,
            nextCursor,
            hasMore
        };

        // Cache the result
        await cache.set(cacheKey, result, CACHE_TTL.feed);

        return result;
    } catch (error) {
        console.error('Error getting personalized feed:', error);
        throw error;
    }
}

/**
 * Get trending posts
 * Formula: (likes + comments×2 + bookmarks×1.5) / age_in_hours
 * @param limit - Number of posts to return
 * @returns Trending posts from last 7 days
 */
export async function getTrendingPosts(limit: number = 20) {
    try {
        // Check cache first
        const cacheKey = CACHE_KEYS.trendingPosts();
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return cached;
        }

        // Get posts from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const posts = await prisma.post.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
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
                },
                _count: {
                    select: {
                        postComments: true,
                        postLikes: true,
                        postBookmarks: true
                    }
                }
            }
        });

        // Calculate trending score for each post
        const now = new Date();
        const scoredPosts = (posts || []).map((post: any) => {
            const ageInHours = (now.getTime() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
            const engagementScore =
                post.likes +
                (post._count.postComments * 2) +
                (post._count.postBookmarks * 1.5);

            const trendingScore = engagementScore / Math.max(ageInHours, 1);

            return {
                ...post,
                trendingScore
            };
        });

        // Sort by trending score
        scoredPosts.sort((a: any, b: any) => b.trendingScore - a.trendingScore);

        // Take top posts and transform to frontend interface
        const trendingPosts = scoredPosts.slice(0, limit).map((post: any) => ({
            id: post.id,
            userId: post.userId,
            title: post.title,
            routes: post.routes as unknown as Route[],
            images: post.images,
            tags: post.tags,
            likes: post.likes,
            dislikes: post.dislikes,
            comments: post._count.postComments,
            bookmarks: post._count.postBookmarks,
            views: post.views,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        }));

        // Cache the result
        await cache.set(cacheKey, trendingPosts, CACHE_TTL.trending);

        return trendingPosts;
    } catch (error) {
        console.error('Error getting trending posts:', error);
        throw error;
    }
}

/**
 * Get user's favorite tags based on their activity
 * @param userId - User ID
 * @returns Array of favorite tags
 */
export async function getUserFavoriteTags(userId: string): Promise<string[]> {
    try {
        // Get user's recent interactions (likes, bookmarks, comments)
        const activities = await prisma.userActivity.findMany({
            where: {
                userId,
                type: {
                    in: ['LIKE', 'BOOKMARK', 'COMMENT']
                }
            },
            take: 100,
            orderBy: { createdAt: 'desc' },
            include: {
                post: {
                    select: { tags: true }
                }
            }
        });

        // Count tag frequencies
        const tagCounts: Record<string, number> = {};
        activities.forEach((activity: any) => {
            if (activity.post) {
                activity.post.tags.forEach((tag: string) => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + activity.score;
                });
            }
        });

        // Sort tags by frequency and return top 10
        const sortedTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag]) => tag);

        return sortedTags;
    } catch (error) {
        console.error('Error getting user favorite tags:', error);
        return [];
    }
}

/**
 * Enrich posts with user interaction state
 * @param posts - Array of posts
 * @param userId - User ID
 * @returns Posts with isLiked, isDisliked, isBookmarked flags
 */
async function enrichPostsWithUserState(posts: any[], userId: string) {
    try {
        const postIds = (posts || []).map(p => p.id);

        // Get user's likes
        const likes = await prisma.like.findMany({
            where: {
                userId,
                postId: { in: postIds }
            }
        });

        // Get user's bookmarks
        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId,
                postId: { in: postIds }
            }
        });

        const likeMap = new Map(likes.map((l: any) => [l.postId, l.type]));
        const bookmarkSet = new Set(bookmarks.map((b: any) => b.postId));

        return (posts || []).map(post => ({
            ...post,
            isLiked: likeMap.get(post.id) === 'LIKE',
            isDisliked: likeMap.get(post.id) === 'DISLIKE',
            isBookmarked: bookmarkSet.has(post.id)
        }));
    } catch (error) {
        console.error('Error enriching posts with user state:', error);
        return posts;
    }
}

/**
 * Calculate engagement score for a post
 * @param post - Post object
 * @returns Engagement score
 */
function calculateEngagementScore(post: any): number {
    return post.likes + (post.comments * 2) + (post.bookmarks * 1.5);
}

/**
 * Invalidate feed cache for a user
 * @param userId - User ID
 */
export async function invalidateFeedCache(userId: string) {
    try {
        await cache.delPattern(`feed:${userId}*`);
    } catch (error) {
        console.error('Error invalidating feed cache:', error);
    }
}

/**
 * Invalidate trending posts cache
 */
export async function invalidateTrendingCache() {
    try {
        await cache.del(CACHE_KEYS.trendingPosts());
    } catch (error) {
        console.error('Error invalidating trending cache:', error);
    }
}

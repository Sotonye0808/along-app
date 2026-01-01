/**
 * Suggestions Service
 * 
 * Implements user suggestion algorithm with intelligent scoring
 * based on location, interests, mutual connections, and verified status.
 */

import { prisma } from '../db/prisma';
import { cache, CACHE_KEYS, CACHE_TTL } from '../cache/redis';

/**
 * Get user suggestions
 * Scoring system (max 100 points):
 * - Location proximity: 40 points (exact) or 20 points (similar)
 * - Similar interests via tags: 30 points (7.5 per common tag, max 4)
 * - Mutual connections: 20 points (5 per mutual, max 4)
 * - Verified status: 10 points
 * 
 * @param userId - User ID requesting suggestions
 * @param limit - Number of suggestions to return (default: 5)
 * @returns Top scored user suggestions
 */
export async function getUserSuggestions(
    userId: string,
    limit: number = 5
) {
    try {
        // Check cache first
        const cacheKey = CACHE_KEYS.userSuggestions(userId);
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return cached;
        }

        // Get current user data
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                location: true,
                following: {
                    select: { followingId: true }
                }
            }
        });

        if (!currentUser) {
            throw new Error('User not found');
        }

        const followingIds = currentUser.following.map((f: any) => f.followingId);
        const userFavoriteTags = await getUserFavoriteTags(userId);

        // Get potential suggestions (exclude self and already following)
        const potentialSuggestions = await prisma.user.findMany({
            where: {
                id: {
                    notIn: [userId, ...followingIds]
                }
            },
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                avatar: true,
                bio: true,
                location: true,
                verified: true,
                followers: {
                    select: { followerId: true }
                }
            },
            take: 100 // Get more candidates for better scoring
        });

        // Get user's favorite tags for scoring
        const userTagsSet = new Set(userFavoriteTags);

        // Score each potential suggestion
        const scoredSuggestions = await Promise.all(
            potentialSuggestions.map(async (user: any) => {
                let score = 0;

                // 1. Location proximity (40 points max)
                if (currentUser.location && user.location) {
                    if (isSimilarLocation(currentUser.location, user.location)) {
                        score += user.location === currentUser.location ? 40 : 20;
                    }
                }

                // 2. Similar interests via tags (30 points max)
                const userTags = await getUserPostTags(user.id);
                const commonTags = userTags.filter(tag => userTagsSet.has(tag));
                const tagScore = Math.min(commonTags.length, 4) * 7.5;
                score += tagScore;

                // 3. Mutual connections (20 points max)
                const mutualFollowers = user.followers.filter((f: any) =>
                    followingIds.includes(f.followerId)
                );
                const mutualScore = Math.min(mutualFollowers.length, 4) * 5;
                score += mutualScore;

                // 4. Verified status (10 points)
                if (user.verified) {
                    score += 10;
                }

                return {
                    id: user.id,
                    userName: user.userName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                    bio: user.bio,
                    location: user.location,
                    verified: user.verified,
                    followerCount: user.followers.length,
                    mutualFollowers: mutualFollowers.length,
                    commonTags: commonTags.length,
                    score
                };
            })
        );

        // Sort by score and take top N
        scoredSuggestions.sort((a: any, b: any) => b.score - a.score);
        const topSuggestions = scoredSuggestions.slice(0, limit);

        // Cache the results
        await cache.set(cacheKey, topSuggestions, CACHE_TTL.suggestions);

        return topSuggestions;
    } catch (error) {
        console.error('Error getting user suggestions:', error);
        throw error;
    }
}

/**
 * Check if two locations are similar
 * @param location1 - First location
 * @param location2 - Second location
 * @returns True if locations are similar
 */
export function isSimilarLocation(location1: string, location2: string): boolean {
    if (!location1 || !location2) return false;

    // Exact match
    if (location1.toLowerCase() === location2.toLowerCase()) {
        return true;
    }

    // Check if locations share common parts (city, state, country)
    const parts1 = location1.toLowerCase().split(',').map(p => p.trim());
    const parts2 = location2.toLowerCase().split(',').map(p => p.trim());

    // If they share any common part (except very short ones)
    const commonParts = parts1.filter(part =>
        part.length > 2 && parts2.some(p => p.includes(part) || part.includes(p))
    );

    return commonParts.length > 0;
}

/**
 * Get user's post tags for interest matching
 * @param userId - User ID
 * @returns Array of tags from user's posts
 */
export async function getUserPostTags(userId: string): Promise<string[]> {
    try {
        const posts = await prisma.post.findMany({
            where: { userId },
            select: { tags: true },
            take: 20 // Get recent posts
        });

        // Flatten and deduplicate tags
        const tags = new Set<string>();
        posts.forEach((post: any) => {
            post.tags.forEach((tag: string) => tags.add(tag));
        });

        return Array.from(tags);
    } catch (error) {
        console.error('Error getting user post tags:', error);
        return [];
    }
}

/**
 * Get user's favorite tags based on activity
 * @param userId - User ID
 * @returns Array of favorite tags
 */
export async function getUserFavoriteTags(userId: string): Promise<string[]> {
    try {
        // Get user's recent interactions
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

        // Count tag frequencies with weighted scoring
        const tagCounts: Record<string, number> = {};
        activities.forEach((activity: any) => {
            if (activity.post) {
                activity.post.tags.forEach((tag: string) => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + activity.score;
                });
            }
        });

        // Also include tags from user's own posts
        const userPosts = await prisma.post.findMany({
            where: { userId },
            select: { tags: true },
            take: 20
        });

        userPosts.forEach((post: any) => {
            post.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 0.5; // Lower weight for own posts
            });
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
 * Get mutual followers between two users
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns Array of mutual follower IDs
 */
export async function getMutualFollowers(
    userId1: string,
    userId2: string
): Promise<string[]> {
    try {
        const [user1Followers, user2Followers] = await Promise.all([
            prisma.follow.findMany({
                where: { followingId: userId1 },
                select: { followerId: true }
            }),
            prisma.follow.findMany({
                where: { followingId: userId2 },
                select: { followerId: true }
            })
        ]);

        const user1FollowerIds = new Set(user1Followers.map((f: any) => f.followerId));
        const mutualFollowers = user2Followers
            .map((f: any) => f.followerId)
            .filter((id: string) => user1FollowerIds.has(id));

        return mutualFollowers;
    } catch (error) {
        console.error('Error getting mutual followers:', error);
        return [];
    }
}

/**
 * Get users from the same location
 * @param userId - User ID
 * @param limit - Number of users to return
 * @returns Users from same location
 */
export async function getUsersFromSameLocation(
    userId: string,
    limit: number = 10
) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { location: true, following: { select: { followingId: true } } }
        });

        if (!user || !user.location) {
            return [];
        }

        const followingIds = user.following.map((f: any) => f.followingId);

        const users = await prisma.user.findMany({
            where: {
                location: user.location,
                id: {
                    notIn: [userId, ...followingIds]
                }
            },
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                avatar: true,
                verified: true,
                location: true
            },
            take: limit
        });

        return users;
    } catch (error) {
        console.error('Error getting users from same location:', error);
        return [];
    }
}

/**
 * Invalidate suggestions cache for a user
 * @param userId - User ID
 */
export async function invalidateSuggestionsCache(userId: string) {
    try {
        await cache.del(CACHE_KEYS.userSuggestions(userId));
    } catch (error) {
        console.error('Error invalidating suggestions cache:', error);
    }
}

/**
 * Invalidate suggestions cache for multiple users
 * Useful when someone follows/unfollows
 * @param userIds - Array of user IDs
 */
export async function invalidateMultipleSuggestionsCache(userIds: string[]) {
    try {
        await Promise.all(
            userIds.map(userId => cache.del(CACHE_KEYS.userSuggestions(userId)))
        );
    } catch (error) {
        console.error('Error invalidating multiple suggestions cache:', error);
    }
}

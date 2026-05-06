/**
 * PlatformSuggestionsService
 *
 * Generates platform-authored route suggestions ("Along Suggestions").
 * These are synthetic posts authored by the platform to surface popular
 * routes in a region when organic content is sparse.
 *
 * Platform posts are stored with `isPlatformGen: true` so the feed and
 * PostCard can render them with the "Along Suggestion" label chip.
 */

import { prisma } from "@/lib/db/prisma";
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache/redis";

export interface PlatformSuggestionInput {
  title: string;
  region: string;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
  totalDistanceKm?: number;
  estimatedMins?: number;
  routes: Array<{
    text: string;
    vehicles: string[];
    fare?: number;
    order: number;
  }>;
  tags?: string[];
}

const PLATFORM_USER_EMAIL = process.env.PLATFORM_USER_EMAIL ?? "platform@along.app";
const PLATFORM_GEN_CACHE_TTL = CACHE_TTL.feed;

export class PlatformSuggestionsService {
  /**
   * Ensure the platform bot user exists in the DB.
   * Returns the user id.
   */
  private static async getPlatformUserId(): Promise<string | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: PLATFORM_USER_EMAIL },
        select: { id: true },
      });
      return user?.id ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Create a new platform-generated route suggestion post in the DB.
   */
  static async createSuggestion(
    input: PlatformSuggestionInput,
  ): Promise<{ id: string } | null> {
    const platformUserId = await PlatformSuggestionsService.getPlatformUserId();
    if (!platformUserId) return null;

    try {
      const post = await prisma.post.create({
        data: {
          userId: platformUserId,
          title: input.title,
          region: input.region,
          startLat: input.startLat,
          startLng: input.startLng,
          endLat: input.endLat,
          endLng: input.endLng,
          totalDistanceKm: input.totalDistanceKm,
          estimatedMins: input.estimatedMins,
          routes: input.routes.map((r) => ({
            id: `platform-${Date.now()}-${r.order}`,
            text: r.text,
            links: [],
            order: r.order,
            vehicles: r.vehicles,
            fare: r.fare ?? 0,
            status: "unverified",
          })),
          tags: input.tags ?? [],
          images: [],
          isPlatformGen: true,
          validityScore: 0,
        },
        select: { id: true },
      });
      return post;
    } catch {
      return null;
    }
  }

  /**
   * Fetch platform-generated suggestions for a given region.
   * Results are cached.
   */
  static async getSuggestionsForRegion(
    region: string,
    limit = 5,
  ): Promise<Post[]> {
    const cacheKey = `platform_suggestions:${region}:${limit}`;
    const cached = await cache.get<Post[]>(cacheKey);
    if (cached) return cached;

    try {
      const rows = await prisma.post.findMany({
        where: { isPlatformGen: true, region },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      // Cast Prisma result to our Post global type
      const posts = rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        title: r.title,
        routes: r.routes as unknown as Route[],
        images: r.images,
        tags: r.tags,
        likes: r.likes,
        dislikes: r.dislikes,
        comments: r.comments,
        bookmarks: r.bookmarks,
        validityScore: r.validityScore,
        validityTier: r.validityTier ?? undefined,
        isPlatformGen: r.isPlatformGen,
        region: r.region ?? undefined,
        startLat: r.startLat ?? undefined,
        startLng: r.startLng ?? undefined,
        endLat: r.endLat ?? undefined,
        endLng: r.endLng ?? undefined,
        totalDistanceKm: r.totalDistanceKm ?? undefined,
        estimatedMins: r.estimatedMins ?? undefined,
        views: r.views,
        shares: r.shares,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })) as Post[];

      await cache.set(cacheKey, posts, PLATFORM_GEN_CACHE_TTL);
      return posts;
    } catch {
      return [];
    }
  }

  /**
   * Return a sample of platform suggestions for the home feed (any region).
   */
  static async getFeedSuggestions(limit = 3): Promise<Post[]> {
    const cacheKey = `platform_suggestions:all:${limit}`;
    const cached = await cache.get<Post[]>(cacheKey);
    if (cached) return cached;

    try {
      const rows = await prisma.post.findMany({
        where: { isPlatformGen: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      const posts = rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        title: r.title,
        routes: r.routes as unknown as Route[],
        images: r.images,
        tags: r.tags,
        likes: r.likes,
        dislikes: r.dislikes,
        comments: r.comments,
        bookmarks: r.bookmarks,
        validityScore: r.validityScore,
        validityTier: r.validityTier ?? undefined,
        isPlatformGen: r.isPlatformGen,
        region: r.region ?? undefined,
        startLat: r.startLat ?? undefined,
        startLng: r.startLng ?? undefined,
        endLat: r.endLat ?? undefined,
        endLng: r.endLng ?? undefined,
        totalDistanceKm: r.totalDistanceKm ?? undefined,
        estimatedMins: r.estimatedMins ?? undefined,
        views: r.views,
        shares: r.shares,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })) as Post[];

      await cache.set(cacheKey, posts, PLATFORM_GEN_CACHE_TTL);
      return posts;
    } catch {
      return [];
    }
  }
}

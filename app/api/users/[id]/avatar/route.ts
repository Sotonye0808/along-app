import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByUser } from "@/lib/utils/rateLimiter";
import { cache, CACHE_KEYS } from "@/lib/cache/redis";
import { handlePrismaError } from "@/lib/utils/prismaErrors";
import { AVATAR_STYLES } from "@/lib/config/avatar";

const avatarConfigSchema = z.object({
  style: z.enum(AVATAR_STYLES as unknown as [string, ...string[]]),
  seed: z.string().min(1).max(100),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  radius: z.number().int().min(0).max(50).optional(),
});

/**
 * PATCH /api/users/[id]/avatar
 * Update the DiceBear avatar configuration for a user.
 * Requires authentication and ownership.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authUser = await requireAuth(request);

    if (authUser !== id) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own avatar" },
        { status: 403 },
      );
    }

    const rateLimit = await rateLimitByUser(authUser, {
      maxRequests: 30,
      windowSeconds: 3600,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(rateLimit.reset) } },
      );
    }

    const body: unknown = await request.json();
    const avatarConfig = avatarConfigSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { avatarConfig },
      select: { id: true, avatarConfig: true },
    });

    await cache.del(CACHE_KEYS.userProfile(id));

    return NextResponse.json({
      avatarConfig: updatedUser.avatarConfig,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    const prismaError = handlePrismaError(error, "User");
    if (prismaError) {
      return prismaError;
    }

    console.error("Error updating avatar config:", error);
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 },
    );
  }
}

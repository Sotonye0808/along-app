import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticateRequest, requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByIP, rateLimitByUser } from '@/lib/utils/rateLimiter';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';
import { uploadImage, deleteImage, validateImageFile, fileToBase64 } from '@/lib/utils/cloudinary';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema for profile updates
const updateProfileSchema = z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    avatar: z.string().optional(), // base64 image
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).optional(),
});

/**
 * GET /api/users/[id]
 * Get user profile with stats
 * Public endpoint with caching
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        // Rate limiting for unauthenticated requests
        const authUser = await authenticateRequest(request);
        if (!authUser) {
            const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
            const rateLimit = await rateLimitByIP(ip, {
                maxRequests: 100,
                windowSeconds: 60,
            });

            if (!rateLimit.success) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded' },
                    { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } }
                );
            }
        }

        // Check cache first
        const cacheKey = CACHE_KEYS.userProfile(id);
        const cached = await cache.get<string>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Fetch user with relations
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                bio: true,
                location: true,
                verified: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                        likes: true,
                        bookmarks: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Transform to match frontend expectations
        const transformedUser = {
            id: user.id,
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            location: user.location,
            verified: user.verified,
            followers: user._count.followers,
            following: [], // Frontend expects array, but we only expose count
            likes: [], // Frontend expects array, but we only expose count
            bookmarks: [], // Frontend expects array, but we only expose count
            createdAt: user.createdAt.toISOString(),
        };

        // Cache for 10 minutes
        await cache.set(cacheKey, transformedUser, CACHE_TTL.profile);

        return NextResponse.json(transformedUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

/**
 * PUT /api/users/[id]
 * Update user profile
 * Requires authentication and ownership
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = await requireAuth(request);

        // Rate limiting
        const rateLimit = await rateLimitByUser(authUser, {
            maxRequests: 20,
            windowSeconds: 3600, // 20 updates per hour
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } }
            );
        }

        // Verify ownership
        if (authUser !== id) {
            return NextResponse.json(
                { error: 'Forbidden: You can only update your own profile' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);

        // Fetch current user
        const currentUser = await prisma.user.findUnique({
            where: { id },
            select: { password: true, avatar: true },
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Handle password change
        let hashedPassword: string | undefined;
        if (validatedData.currentPassword && validatedData.newPassword) {
            const isPasswordValid = await bcrypt.compare(
                validatedData.currentPassword,
                currentUser.password
            );

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 400 }
                );
            }

            hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);
        }

        // Handle avatar upload
        let avatarUrl = currentUser.avatar;
        if (validatedData.avatar && validatedData.avatar.startsWith('data:image')) {
            // Validate base64 image size (approximate)
            const base64Length = validatedData.avatar.length * 0.75; // Approximate size in bytes
            if (base64Length > 5 * 1024 * 1024) { // 5MB limit
                return NextResponse.json(
                    { error: 'Image size must be less than 5MB' },
                    { status: 400 }
                );
            }

            // Delete old avatar from Cloudinary
            if (currentUser.avatar) {
                await deleteImage(currentUser.avatar).catch(console.error);
            }

            // Upload new avatar
            const uploadResult = await uploadImage(validatedData.avatar, 'avatar');
            avatarUrl = uploadResult.url;
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(validatedData.firstName && { firstName: validatedData.firstName }),
                ...(validatedData.lastName && { lastName: validatedData.lastName }),
                ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
                ...(validatedData.location !== undefined && { location: validatedData.location }),
                ...(avatarUrl && { avatar: avatarUrl }),
                ...(hashedPassword && { password: hashedPassword }),
            },
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                bio: true,
                location: true,
                verified: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
        });

        // Invalidate cache
        await cache.del(CACHE_KEYS.userProfile(id));

        // Transform response
        const transformedUser = {
            id: updatedUser.id,
            userName: updatedUser.userName,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            location: updatedUser.location,
            verified: updatedUser.verified,
            followers: updatedUser._count.followers,
            following: [],
            likes: [],
            bookmarks: [],
            createdAt: updatedUser.createdAt.toISOString(),
        };

        return NextResponse.json(transformedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/users/[id]
 * Delete user account (soft delete or hard delete)
 * Requires authentication and ownership
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = await requireAuth(request);

        // Verify ownership
        if (authUser !== id) {
            return NextResponse.json(
                { error: 'Forbidden: You can only delete your own account' },
                { status: 403 }
            );
        }

        // Fetch user to get avatar for cleanup
        const user = await prisma.user.findUnique({
            where: { id },
            select: { avatar: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete avatar from Cloudinary
        if (user.avatar) {
            await deleteImage(user.avatar).catch(console.error);
        }

        // Delete user (cascade will handle related records)
        await prisma.user.delete({
            where: { id },
        });

        // Invalidate cache
        await cache.del(CACHE_KEYS.userProfile(id));

        return NextResponse.json(
            { message: 'User deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}

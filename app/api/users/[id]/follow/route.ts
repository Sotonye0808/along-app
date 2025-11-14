import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";

// POST /api/users/:id/follow - Follow/Unfollow a user
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetUserId } = await params;

        // Check if request has a body
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json(
                { error: 'Content-Type must be application/json' },
                { status: 400 }
            );
        }

        let userId: string;
        try {
            const body = await request.json();
            userId = body.userId;
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        if (userId === targetUserId) {
            return NextResponse.json(
                { error: "Cannot follow yourself" },
                { status: 400 }
            );
        }

        const currentUser = await db.getUserById(userId);
        const targetUser = await db.getUserById(targetUserId);

        if (!currentUser || !targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if already following
        const isFollowing = currentUser.following?.includes(targetUserId) || false;

        if (isFollowing) {
            // Unfollow
            const updatedCurrentUser = db.updateUser(userId, {
                following: currentUser.following?.filter((id) => id !== targetUserId),
            });

            const updatedTargetUser = db.updateUser(targetUserId, {
                followers: (targetUser.followers || 0) - 1,
            });

            return NextResponse.json({
                message: "Unfollowed successfully",
                isFollowing: false,
                user: updatedTargetUser,
            });
        } else {
            // Follow
            const updatedCurrentUser = db.updateUser(userId, {
                following: [...(currentUser.following || []), targetUserId],
            });

            const updatedTargetUser = db.updateUser(targetUserId, {
                followers: (targetUser.followers || 0) + 1,
            });

            // Create notification
            db.createNotification({
                userId: targetUserId,
                type: "follow",
                message: `${currentUser.firstName} ${currentUser.lastName} started following you`,
                read: false,
            });

            return NextResponse.json({
                message: "Followed successfully",
                isFollowing: true,
                user: updatedTargetUser,
            });
        }
    } catch (error) {
        console.error("Follow error:", error);
        return NextResponse.json(
            { error: "Failed to process follow request" },
            { status: 500 }
        );
    }
}

// GET /api/users/:id/follow - Check if current user follows target user
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetUserId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        const currentUser = await db.getUserById(userId);

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isFollowing = currentUser.following?.includes(targetUserId) || false;

        return NextResponse.json({ isFollowing });
    } catch (error) {
        console.error("Check follow error:", error);
        return NextResponse.json(
            { error: "Failed to check follow status" },
            { status: 500 }
        );
    }
}

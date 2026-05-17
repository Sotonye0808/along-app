import { prisma } from "./prisma";

export interface ReviewListFilters {
    status?: "PENDING" | "APPROVED" | "REJECTED";
    cursor?: string;
    limit?: number;
}

export class UserReviewRepository {
    async listForAdmin(filters: ReviewListFilters = {}) {
        const limit = Math.min(filters.limit ?? 20, 50);

        const reviews = await prisma.userReview.findMany({
            where: {
                ...(filters.status ? { status: filters.status } : {}),
            },
            take: limit + 1,
            ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                rating: true,
                comment: true,
                status: true,
                createdAt: true,
                reviewer: {
                    select: { id: true, userName: true, firstName: true, lastName: true, avatarConfig: true, verified: true },
                },
                reviewee: {
                    select: { id: true, userName: true, firstName: true, lastName: true, avatarConfig: true, verified: true },
                },
            },
        });

        const hasMore = reviews.length > limit;
        const page = hasMore ? reviews.slice(0, limit) : reviews;
        const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

        return { data: page, nextCursor };
    }

    async updateStatus(id: string, status: "PENDING" | "APPROVED" | "REJECTED") {
        return prisma.userReview.update({
            where: { id },
            data: { status },
            select: {
                id: true,
                status: true,
                updatedAt: true,
            },
        });
    }

    async countByStatus() {
        const [pending, approved, rejected, total] = await Promise.all([
            prisma.userReview.count({ where: { status: "PENDING" } }),
            prisma.userReview.count({ where: { status: "APPROVED" } }),
            prisma.userReview.count({ where: { status: "REJECTED" } }),
            prisma.userReview.count(),
        ]);

        return { pending, approved, rejected, total };
    }
}

export const userReviewRepository = new UserReviewRepository();

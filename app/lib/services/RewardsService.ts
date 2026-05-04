/**
 * RewardsService — OOP service for point computation, tier management and leaderboard.
 * All thresholds and per-action values are driven by REWARD_TIERS / POINTS_CONFIG.
 */
import { prisma } from "../db/prisma";
import {
    PointsAction,
    POINTS_CONFIG,
    REWARD_TIERS,
    type RewardTier,
} from "../config/rewards";

export interface RewardSummary {
    userId: string;
    rewardPoints: number;
    rewardTier: RewardTier;
    nextTier: RewardTier | null;
    pointsToNextTier: number | null;
    progressPercent: number;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rewardPoints: number;
    rewardTier: string;
}

export class RewardsService {
    /**
     * Map a Prisma RewardTier enum string back to the config RewardTier object.
     */
    getTierForPoints(points: number): RewardTier {
        const sorted = [...REWARD_TIERS].sort((a, b) => b.minPoints - a.minPoints);
        return sorted.find((t) => points >= t.minPoints) ?? REWARD_TIERS[0];
    }

    private getNextTier(currentTier: RewardTier): RewardTier | null {
        const idx = REWARD_TIERS.findIndex((t) => t.key === currentTier.key);
        return idx < REWARD_TIERS.length - 1 ? REWARD_TIERS[idx + 1] : null;
    }

    private computeProgressPercent(
        points: number,
        current: RewardTier,
        next: RewardTier | null,
    ): number {
        if (!next) return 100;
        const range = next.minPoints - current.minPoints;
        const earned = points - current.minPoints;
        return Math.min(Math.round((earned / range) * 100), 100);
    }

    /**
     * Fetch full reward summary for a user from the DB.
     */
    async getSummary(userId: string): Promise<RewardSummary> {
        const user = await prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { id: true, rewardPoints: true, rewardTier: true },
        });

        const currentTier = this.getTierForPoints(user.rewardPoints);
        const nextTier = this.getNextTier(currentTier);
        const pointsToNextTier = nextTier
            ? nextTier.minPoints - user.rewardPoints
            : null;

        return {
            userId: user.id,
            rewardPoints: user.rewardPoints,
            rewardTier: currentTier,
            nextTier,
            pointsToNextTier,
            progressPercent: this.computeProgressPercent(
                user.rewardPoints,
                currentTier,
                nextTier,
            ),
        };
    }

    /**
     * Award points for an action and update the user's tier if it changes.
     * Returns new total points.
     */
    async awardPoints(userId: string, action: PointsAction): Promise<number> {
        const delta = POINTS_CONFIG[action] ?? 0;
        if (delta === 0) return (await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { rewardPoints: true } })).rewardPoints;

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { rewardPoints: { increment: delta } },
            select: { rewardPoints: true },
        });

        const tier = this.getTierForPoints(updated.rewardPoints);
        const prismaKey = tier.key.toUpperCase() as "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

        await prisma.user.update({
            where: { id: userId },
            data: { rewardTier: prismaKey },
        });

        return updated.rewardPoints;
    }

    /**
     * Get the top N users by reward points.
     */
    async getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
        const users = await prisma.user.findMany({
            orderBy: { rewardPoints: "desc" },
            take: limit,
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                avatar: true,
                avatarConfig: true,
                rewardPoints: true,
                rewardTier: true,
            },
        });

        return users.map((u, idx) => ({
            rank: idx + 1,
            userId: u.id,
            userName: u.userName,
            firstName: u.firstName,
            lastName: u.lastName,
            avatar: u.avatar ?? undefined,
            rewardPoints: u.rewardPoints,
            rewardTier: u.rewardTier,
        }));
    }
}

export const rewardsService = new RewardsService();

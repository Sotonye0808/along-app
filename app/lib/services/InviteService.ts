/**
 * InviteService — manages invite code generation, lookup and acceptance.
 * Invite codes are stored directly on the User model (User.inviteCode).
 * When a new user registers with ?ref=<code>, their invitedById is set
 * and the inviter receives INVITE_ACCEPTED reward points.
 */
import { prisma } from "../db/prisma";
import { INVITE_CONFIG } from "../config/inviteConfig";
import { PointsAction } from "../config/rewards";
import { rewardsService } from "./RewardsService";

function generateCode(length: number): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // readable charset
    return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
}

export interface InviteData {
    code: string;
    inviteUrl: string;
    inviterUserName: string;
    invitedCount: number;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    firstName: string;
    lastName: string;
    invitedCount: number;
}

export class InviteService {
    /**
     * Get or create the invite code for a user.
     */
    async getOrCreateCode(userId: string, appBaseUrl: string): Promise<InviteData> {
        let user = await prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: {
                id: true,
                userName: true,
                inviteCode: true,
                _count: { select: { invitedUsers: true } },
            },
        });

        let code = user.inviteCode;
        if (!code) {
            let unique = false;
            while (!unique) {
                const candidate = generateCode(INVITE_CONFIG.codeLength);
                const existing = await prisma.user.findUnique({
                    where: { inviteCode: candidate },
                    select: { id: true },
                });
                if (!existing) {
                    code = candidate;
                    unique = true;
                }
            }
            await prisma.user.update({
                where: { id: userId },
                data: { inviteCode: code },
            });
        }

        return {
            code: code!,
            inviteUrl: `${appBaseUrl}${INVITE_CONFIG.inviteUrlBasePath}/${code}`,
            inviterUserName: user.userName,
            invitedCount: user._count.invitedUsers,
        };
    }

    /**
     * Process an accepted invite: link the new user to the inviter and award points.
     * Should be called during registration when a valid invite code is present.
     */
    async acceptInvite(newUserId: string, inviteCode: string): Promise<void> {
        const inviter = await prisma.user.findUnique({
            where: { inviteCode },
            select: { id: true },
        });
        if (!inviter) return;

        await prisma.user.update({
            where: { id: newUserId },
            data: { invitedById: inviter.id },
        });

        await rewardsService.awardPoints(inviter.id, PointsAction.INVITE_ACCEPTED);
    }

    /**
     * Validate an invite code and return the inviter's display name.
     */
    async validateCode(
        code: string,
    ): Promise<{ valid: boolean; inviterUserName?: string }> {
        if (!code || code.length !== INVITE_CONFIG.codeLength) return { valid: false };
        const user = await prisma.user.findUnique({
            where: { inviteCode: code },
            select: { userName: true },
        });
        if (!user) return { valid: false };
        return { valid: true, inviterUserName: user.userName };
    }

    /**
     * Get top inviters leaderboard.
     */
    async getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
        const users = await prisma.user.findMany({
            where: { invitedUsers: { some: {} } },
            orderBy: { invitedUsers: { _count: "desc" } },
            take: limit,
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                _count: { select: { invitedUsers: true } },
            },
        });

        return users.map((u, idx) => ({
            rank: idx + 1,
            userId: u.id,
            userName: u.userName,
            firstName: u.firstName,
            lastName: u.lastName,
            invitedCount: u._count.invitedUsers,
        }));
    }
}

export const inviteService = new InviteService();

import { prisma } from "./prisma";

export class AdminAccessRepository {
    async isAdmin(userId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        return user?.role === "ADMIN";
    }
}

export const adminAccessRepository = new AdminAccessRepository();

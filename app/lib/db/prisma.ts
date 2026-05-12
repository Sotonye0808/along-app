/**
 * Prisma Client Singleton
 * 
 * This file creates a singleton instance of Prisma Client to prevent
 * multiple instances during development with hot reloading.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@/app/generated/prisma/client'
import { isProjectDev } from "@/lib/utils/env";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const connectionString = isProjectDev()
    ? process.env.LOCAL_DB
    : `${process.env.DIRECT_URL || process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: isProjectDev() ? ['query', 'error', 'warn'] : ['error'],
    } as any); // Type assertion needed for Prisma 7 configuration compatibility

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

/**
 * Health check function to verify database connection
 * @returns true if connection is successful, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
}

// Graceful shutdown
if (typeof window === 'undefined') {
    process.on('beforeExit', async () => {
        await disconnectDatabase();
    });
}

export default prisma;

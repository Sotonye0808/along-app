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

let prismaInstance: PrismaClient | undefined = globalForPrisma.prisma;

/**
 * Get or create the Prisma client instance
 * Uses lazy initialization to avoid issues during build
 */
function getPrismaClient(): PrismaClient {
    if (prismaInstance) {
        return prismaInstance;
    }

    const connectionString = isProjectDev()
        ? process.env.LOCAL_DB
        : `${process.env.DIRECT_URL || process.env.DATABASE_URL}`;

    if (!connectionString && process.env.NODE_ENV === 'production') {
        throw new Error('Database connection string is required in production');
    }

    // Use a dummy connection string during build if needed
    const dbUrl = connectionString || 'postgresql://dummy@localhost/dummy';
    const adapter = new PrismaPg({ connectionString: dbUrl });

    prismaInstance = new PrismaClient({
        adapter,
        log: isProjectDev() ? ['query', 'error', 'warn'] : ['error'],
    } as any);

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prismaInstance;
    }

    return prismaInstance;
}

// Export a lazy proxy for backward compatibility
export const prisma: any = new Proxy({}, {
    get: (target, prop) => {
        const client = getPrismaClient();
        return (client as any)[prop];
    },
})

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

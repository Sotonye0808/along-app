import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isDev = process.env.NODE_ENV !== "production" || process.env.PROJECT_ENV === "development";

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  accelerateUrl: isDev ? process.env.LOCAL_DB : process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

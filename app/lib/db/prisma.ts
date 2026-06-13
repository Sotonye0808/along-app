import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isDev = process.env.NODE_ENV !== "production" || process.env.PROJECT_ENV === "development";

const accelerateUrl = isDev ? process.env.LOCAL_DB : process.env.DATABASE_URL;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  accelerateUrl: accelerateUrl ?? "",
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

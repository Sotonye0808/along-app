/**
 * Prisma Configuration (Prisma 7+)
 *
 * Root config used by Prisma CLI.
 */
import "dotenv/config";
import { defineConfig } from "prisma/config";

const projectEnv = (
    process.env.PROJECT_ENV || process.env.NODE_ENV || "development"
).toLowerCase();
const useLocalDb = projectEnv === "development";
const datasourceUrl = useLocalDb
    ? process.env.LOCAL_DB
    : process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!datasourceUrl) {
    throw new Error(
        "Missing datasource URL. Set LOCAL_DB for development or DIRECT_URL/DATABASE_URL for production.",
    );
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },
    datasource: {
        url: datasourceUrl,
    },
});

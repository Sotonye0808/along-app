/**
 * Prisma Configuration (Prisma 7+)
 * 
 * This file contains the database connection configuration.
 * Prisma 7 moved connection URLs from schema.prisma to this file.
 */

import 'dotenv/config'
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    schema: 'schema.prisma',
    migrations: {
        path: 'migrations',
        seed: 'tsx prisma/seed.ts',
    },
    datasource: {
        url: env('DATABASE_URL') || '',
    },
});
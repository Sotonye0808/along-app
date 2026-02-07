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
        url: process.env.NODE_ENV === 'development' ? env('LOCAL_DB') : env('DIRECT_URL') || env('DATABASE_URL') || '',
    },
});
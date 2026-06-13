-- AlterTable: Add waypoints JSONB column to Post
ALTER TABLE "Post" ADD COLUMN "waypoints" JSONB;

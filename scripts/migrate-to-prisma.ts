/**
 * Data Migration Script
 * 
 * Migrates data from the mock backend (mockData.ts) to PostgreSQL via Prisma.
 * This script should be run once when transitioning from mock to real database.
 * 
 * Usage: npx tsx scripts/migrate-to-prisma.ts
 */

import { prisma } from '../app/lib/db/prisma';
import { hashPassword } from '../app/lib/utils/security';
import { mockUsers, mockPosts, mockComments, mockLikes, mockBookmarks } from '../app/lib/data/mockData';

async function migrateUsers() {
    console.log('📤 Migrating users...');

    for (const user of mockUsers) {
        try {
            // Hash password if it exists
            const hashedPassword = user.password ? await hashPassword(user.password) : await hashPassword('Password123!');

            await prisma.user.upsert({
                where: { id: user.id },
                update: {},
                create: {
                    id: user.id,
                    userName: user.userName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: hashedPassword,
                    avatar: user.avatar || null,
                    bio: user.bio || null,
                    location: user.location || null,
                    verified: user.verified || false,
                    createdAt: new Date(user.createdAt),
                },
            });

            console.log(`✅ Migrated user: ${user.userName}`);
        } catch (error) {
            console.error(`❌ Failed to migrate user ${user.userName}:`, error);
        }
    }

    console.log(`✅ Successfully migrated ${mockUsers.length} users\n`);
}

async function migrateFollows() {
    console.log('📤 Migrating follows...');

    let followCount = 0;

    for (const user of mockUsers) {
        if (user.following && user.following.length > 0) {
            for (const followingId of user.following) {
                try {
                    await prisma.follow.create({
                        data: {
                            followerId: user.id,
                            followingId: followingId,
                            createdAt: new Date(),
                        },
                    });
                    followCount++;
                } catch (error) {
                    // Skip if already exists or followingId doesn't exist
                    console.log(`⚠️  Skipped follow relationship: ${user.id} -> ${followingId}`);
                }
            }
        }
    }

    console.log(`✅ Successfully migrated ${followCount} follow relationships\n`);
}

async function migratePosts() {
    console.log('📤 Migrating posts...');

    for (const post of mockPosts) {
        try {
            await prisma.post.upsert({
                where: { id: post.id },
                update: {},
                create: {
                    id: post.id,
                    userId: post.userId,
                    title: post.title,
                    routes: post.routes as any, // Prisma will handle JSON serialization
                    images: post.images,
                    tags: post.tags,
                    likes: post.likes,
                    dislikes: post.dislikes,
                    comments: post.comments,
                    bookmarks: post.bookmarks || 0,
                    views: 0,
                    createdAt: new Date(post.createdAt),
                    updatedAt: new Date(post.updatedAt),
                },
            });

            console.log(`✅ Migrated post: ${post.title}`);
        } catch (error) {
            console.error(`❌ Failed to migrate post ${post.id}:`, error);
        }
    }

    console.log(`✅ Successfully migrated ${mockPosts.length} posts\n`);
}

async function migrateComments() {
    console.log('📤 Migrating comments...');

    for (const comment of mockComments) {
        try {
            await prisma.comment.upsert({
                where: { id: comment.id },
                update: {},
                create: {
                    id: comment.id,
                    postId: comment.postId,
                    userId: comment.userId,
                    text: comment.text,
                    likes: comment.likes,
                    dislikes: comment.dislikes,
                    createdAt: new Date(comment.createdAt),
                },
            });

            console.log(`✅ Migrated comment: ${comment.id}`);
        } catch (error) {
            console.error(`❌ Failed to migrate comment ${comment.id}:`, error);
        }
    }

    console.log(`✅ Successfully migrated ${mockComments.length} comments\n`);
}

async function migrateLikes() {
    console.log('📤 Migrating likes...');

    for (const like of mockLikes) {
        try {
            await prisma.like.upsert({
                where: { id: like.id },
                update: {},
                create: {
                    id: like.id,
                    postId: like.postId,
                    userId: like.userId,
                    type: like.type.toUpperCase() as 'LIKE' | 'DISLIKE',
                    createdAt: new Date(),
                },
            });

            console.log(`✅ Migrated like: ${like.id}`);
        } catch (error) {
            console.error(`❌ Failed to migrate like ${like.id}:`, error);
        }
    }

    console.log(`✅ Successfully migrated ${mockLikes.length} likes\n`);
}

async function migrateBookmarks() {
    console.log('📤 Migrating bookmarks...');

    for (const bookmark of mockBookmarks) {
        try {
            await prisma.bookmark.upsert({
                where: { id: bookmark.id },
                update: {},
                create: {
                    id: bookmark.id,
                    postId: bookmark.postId,
                    userId: bookmark.userId,
                    createdAt: new Date(bookmark.createdAt),
                },
            });

            console.log(`✅ Migrated bookmark: ${bookmark.id}`);
        } catch (error) {
            console.error(`❌ Failed to migrate bookmark ${bookmark.id}:`, error);
        }
    }

    console.log(`✅ Successfully migrated ${mockBookmarks.length} bookmarks\n`);
}

async function verifyDataIntegrity() {
    console.log('🔍 Verifying data integrity...\n');

    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const commentCount = await prisma.comment.count();
    const likeCount = await prisma.like.count();
    const bookmarkCount = await prisma.bookmark.count();
    const followCount = await prisma.follow.count();

    console.log('📊 Migration Summary:');
    console.log(`   Users:     ${userCount}`);
    console.log(`   Posts:     ${postCount}`);
    console.log(`   Comments:  ${commentCount}`);
    console.log(`   Likes:     ${likeCount}`);
    console.log(`   Bookmarks: ${bookmarkCount}`);
    console.log(`   Follows:   ${followCount}`);
    console.log('');

    // Test relationships
    const sampleUser = await prisma.user.findFirst({
        include: {
            posts: true,
            comments: true,
            following: true,
            followers: true,
        },
    });

    if (sampleUser) {
        console.log('✅ Sample user with relationships loaded successfully');
        console.log(`   ${sampleUser.userName} has:`);
        console.log(`   - ${sampleUser.posts.length} posts`);
        console.log(`   - ${sampleUser.comments.length} comments`);
        console.log(`   - ${sampleUser.following.length} following`);
        console.log(`   - ${sampleUser.followers.length} followers`);
    }
}

async function main() {
    console.log('🚀 Starting migration from mock backend to Prisma/PostgreSQL\n');

    try {
        // Migrate in order of dependencies
        await migrateUsers();
        await migrateFollows();
        await migratePosts();
        await migrateComments();
        await migrateLikes();
        await migrateBookmarks();

        // Verify everything worked
        await verifyDataIntegrity();

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

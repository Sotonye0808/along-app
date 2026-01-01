/**
 * Database Seeding Script
 * 
 * Seeds the database with realistic test data for development.
 * Can be run multiple times safely (uses upsert).
 * 
 * Usage: npx prisma db seed
 * Or: npx tsx prisma/seed.ts
 */

import { prisma } from '../app/lib/db/prisma';
import { hashPassword } from '../app/lib/utils/security';

// Nigerian cities for realistic location data
const nigerianCities = [
    'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan',
    'Benin City', 'Kaduna', 'Enugu', 'Jos', 'Calabar',
    'Owerri', 'Warri', 'Abeokuta', 'Ilorin', 'Maiduguri'
];

// Travel-related tags
const travelTags = [
    'roadtrip', 'adventure', 'beach', 'mountains', 'city',
    'budget', 'luxury', 'foodie', 'culture', 'wildlife',
    'photography', 'solo', 'family', 'weekend', 'business'
];

// Vehicle types
const vehicles = ['car', 'bus', 'okada', 'keke', 'bicycle', 'walking'];

async function seedUsers() {
    console.log('👥 Seeding users...');

    const users = [
        {
            userName: 'john_traveler',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            location: 'Lagos',
            bio: 'Adventure seeker | Travel blogger | Road trip enthusiast',
            verified: true,
        },
        {
            userName: 'sarah_explorer',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@example.com',
            location: 'Abuja',
            bio: 'Exploring Nigeria one route at a time 🚗',
            verified: true,
        },
        {
            userName: 'mike_routes',
            firstName: 'Mike',
            lastName: 'Williams',
            email: 'mike@example.com',
            location: 'Port Harcourt',
            bio: 'Weekend warrior | Documenting hidden routes',
            verified: false,
        },
        {
            userName: 'emma_wanderlust',
            firstName: 'Emma',
            lastName: 'Brown',
            email: 'emma@example.com',
            location: 'Ibadan',
            bio: 'Travel writer | Culture enthusiast',
            verified: true,
        },
        {
            userName: 'david_navigator',
            firstName: 'David',
            lastName: 'Wilson',
            email: 'david@example.com',
            location: 'Enugu',
            bio: 'Local guide | Love sharing scenic routes',
            verified: false,
        },
    ];

    const createdUsers = [];
    const defaultPassword = await hashPassword('Password123!');

    for (const userData of users) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: {
                ...userData,
                password: defaultPassword,
            },
        });
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.userName}`);
    }

    return createdUsers;
}

async function seedFollows(users: any[]) {
    console.log('🤝 Seeding follow relationships...');

    // Create a network of follows
    const follows = [
        [0, 1], [0, 2], [0, 3], // John follows Sarah, Mike, Emma
        [1, 0], [1, 3], [1, 4], // Sarah follows John, Emma, David
        [2, 0], [2, 1], // Mike follows John, Sarah
        [3, 0], [3, 1], [3, 4], // Emma follows John, Sarah, David
        [4, 1], [4, 3], // David follows Sarah, Emma
    ];

    for (const [followerIdx, followingIdx] of follows) {
        try {
            await prisma.follow.create({
                data: {
                    followerId: users[followerIdx].id,
                    followingId: users[followingIdx].id,
                },
            });
        } catch (error) {
            // Skip if already exists
        }
    }

    console.log(`✅ Created ${follows.length} follow relationships`);
}

async function seedPosts(users: any[]) {
    console.log('📝 Seeding posts...');

    const posts = [
        {
            userId: users[0].id,
            title: 'Lagos to Abuja: The Ultimate Road Trip Guide',
            tags: ['roadtrip', 'adventure', 'longdistance'],
            routes: [
                {
                    id: '1',
                    text: 'Start from Ikeja City Mall. Get your coffee and snacks for the journey.',
                    links: [{ text: 'Ikeja City Mall', url: 'https://maps.google.com' }],
                    order: 0,
                    vehicles: ['car'],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '2',
                    text: 'Take Ibadan Expressway towards Ibadan. Stop at Redemption Camp for restroom break.',
                    links: [],
                    order: 1,
                    vehicles: ['car'],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '3',
                    text: 'Continue through Ibadan to Osogbo. Grab lunch at local restaurant.',
                    links: [],
                    order: 2,
                    vehicles: ['car'],
                    status: 'verified',
                    fare: 15000,
                },
                {
                    id: '4',
                    text: 'Final stretch to Abuja via Lokoja. Amazing views of River Niger bridge!',
                    links: [{ text: 'Niger Bridge', url: 'https://maps.google.com' }],
                    order: 3,
                    vehicles: ['car'],
                    status: 'verified',
                    fare: 0,
                },
            ],
            images: [],
        },
        {
            userId: users[1].id,
            title: 'Weekend Getaway: Abuja to Jos',
            tags: ['weekend', 'mountains', 'scenic'],
            routes: [
                {
                    id: '1',
                    text: 'Start from Jabi Lake Mall. Perfect spot for breakfast.',
                    links: [],
                    order: 0,
                    vehicles: ['car'],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '2',
                    text: 'Drive through scenic routes to Jos. Stop at Shere Hills for photos.',
                    links: [{ text: 'Shere Hills', url: 'https://maps.google.com' }],
                    order: 1,
                    vehicles: ['car'],
                    status: 'verified',
                    fare: 0,
                },
            ],
            images: [],
        },
        {
            userId: users[2].id,
            title: 'Port Harcourt City Tour: Best Food Stops',
            tags: ['foodie', 'city', 'culture'],
            routes: [
                {
                    id: '1',
                    text: 'Start at GRA Phase 2. Try the best bole and fish at the roadside.',
                    links: [],
                    order: 0,
                    vehicles: ['keke', 'okada', 'car'],
                    status: 'unverified',
                    fare: 200,
                },
                {
                    id: '2',
                    text: 'Visit Port Harcourt Mall for ice cream break.',
                    links: [],
                    order: 1,
                    vehicles: ['car'],
                    status: 'verified',
                    fare: 0,
                },
            ],
            images: [],
        },
        {
            userId: users[3].id,
            title: 'Budget-Friendly: Ibadan to Lagos by Public Transport',
            tags: ['budget', 'commute', 'publictransport'],
            routes: [
                {
                    id: '1',
                    text: 'Take bus from Iwo Road Motor Park. Early morning departures recommended.',
                    links: [],
                    order: 0,
                    vehicles: ['bus'],
                    status: 'verified',
                    fare: 3500,
                },
                {
                    id: '2',
                    text: 'Arrive at Ojota Bus Terminal. Connect to your destination via BRT or Keke.',
                    links: [],
                    order: 1,
                    vehicles: ['bus', 'keke'],
                    status: 'verified',
                    fare: 500,
                },
            ],
            images: [],
        },
        {
            userId: users[4].id,
            title: 'Enugu: Coal City Historical Tour',
            tags: ['culture', 'history', 'walking'],
            routes: [
                {
                    id: '1',
                    text: 'Start at National Museum Enugu. Learn about coal mining history.',
                    links: [{ text: 'National Museum', url: 'https://maps.google.com' }],
                    order: 0,
                    vehicles: ['walking'],
                    status: 'verified',
                    fare: 500,
                },
                {
                    id: '2',
                    text: 'Walk to Okpara Square. Great spot for photos and local snacks.',
                    links: [],
                    order: 1,
                    vehicles: ['walking'],
                    status: 'verified',
                    fare: 0,
                },
            ],
            images: [],
        },
    ];

    const createdPosts = [];
    for (const postData of posts) {
        const post = await prisma.post.create({
            data: {
                ...postData,
                likes: Math.floor(Math.random() * 50) + 10,
                dislikes: Math.floor(Math.random() * 5),
                comments: Math.floor(Math.random() * 20),
                bookmarks: Math.floor(Math.random() * 30),
                views: Math.floor(Math.random() * 200) + 50,
            },
        });
        createdPosts.push(post);
        console.log(`✅ Created post: ${post.title}`);
    }

    return createdPosts;
}

async function seedComments(users: any[], posts: any[]) {
    console.log('💬 Seeding comments...');

    const comments = [
        {
            postId: posts[0].id,
            userId: users[1].id,
            text: 'Great guide! I did this trip last month and it was amazing. The Niger Bridge view is breathtaking!',
        },
        {
            postId: posts[0].id,
            userId: users[2].id,
            text: 'How long did the journey take? Planning to do this next weekend.',
        },
        {
            postId: posts[1].id,
            userId: users[0].id,
            text: 'Jos is beautiful! Don\'t forget to visit the Wildlife Park.',
        },
        {
            postId: posts[2].id,
            userId: users[4].id,
            text: 'The bole and fish at GRA is the best! 🔥',
        },
        {
            postId: posts[3].id,
            userId: users[0].id,
            text: 'Very helpful for budget travelers. Thanks for sharing!',
        },
    ];

    for (const commentData of comments) {
        const comment = await prisma.comment.create({
            data: {
                ...commentData,
                likes: Math.floor(Math.random() * 10),
                dislikes: Math.floor(Math.random() * 2),
            },
        });
        console.log(`✅ Created comment on post ${comment.postId}`);
    }
}

async function seedLikes(users: any[], posts: any[]) {
    console.log('👍 Seeding likes...');

    // Each user likes some posts
    const likes = [
        { userId: users[0].id, postId: posts[1].id, type: 'LIKE' },
        { userId: users[0].id, postId: posts[2].id, type: 'LIKE' },
        { userId: users[1].id, postId: posts[0].id, type: 'LIKE' },
        { userId: users[1].id, postId: posts[3].id, type: 'LIKE' },
        { userId: users[2].id, postId: posts[0].id, type: 'LIKE' },
        { userId: users[2].id, postId: posts[4].id, type: 'DISLIKE' },
        { userId: users[3].id, postId: posts[2].id, type: 'LIKE' },
        { userId: users[4].id, postId: posts[1].id, type: 'LIKE' },
    ];

    for (const likeData of likes) {
        try {
            await prisma.like.create({
                data: likeData as any,
            });
        } catch (error) {
            // Skip if already exists
        }
    }

    console.log(`✅ Created ${likes.length} likes`);
}

async function seedBookmarks(users: any[], posts: any[]) {
    console.log('🔖 Seeding bookmarks...');

    const bookmarks = [
        { userId: users[0].id, postId: posts[1].id },
        { userId: users[0].id, postId: posts[3].id },
        { userId: users[1].id, postId: posts[0].id },
        { userId: users[2].id, postId: posts[0].id },
        { userId: users[3].id, postId: posts[2].id },
        { userId: users[4].id, postId: posts[1].id },
    ];

    for (const bookmarkData of bookmarks) {
        try {
            await prisma.bookmark.create({
                data: bookmarkData,
            });
        } catch (error) {
            // Skip if already exists
        }
    }

    console.log(`✅ Created ${bookmarks.length} bookmarks`);
}

async function main() {
    console.log('🌱 Starting database seeding...\n');

    try {
        const users = await seedUsers();
        await seedFollows(users);
        const posts = await seedPosts(users);
        await seedComments(users, posts);
        await seedLikes(users, posts);
        await seedBookmarks(users, posts);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📊 Seed Summary:');
        console.log(`   Users:     ${users.length}`);
        console.log(`   Posts:     ${posts.length}`);
        console.log('   Comments:  5');
        console.log('   Likes:     8');
        console.log('   Bookmarks: 6');
        console.log('   Follows:   10');
        console.log('\n💡 Default password for all users: Password123!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

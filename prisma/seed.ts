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
import type { User as PrismaUser } from '../app/generated/prisma/client';
import { DEFAULT_EMAIL_CONFIG, DEFAULT_EMAIL_TEMPLATES } from '../app/lib/config/email';
import { DEFAULT_VALIDITY_CONFIG } from '../app/lib/config/validityConfig';
import { DEFAULT_FEED_CONFIG } from '../app/lib/config/feedAlgorithm';
import type { VehicleType } from '../app/lib/types';

// Type definitions for seed data
interface Coordinate {
    lat: number;
    lng: number;
}

interface RouteLink {
    text: string;
    url: string;
}

interface Route {
    id: string;
    text: string;
    links: RouteLink[];
    order: number;
    vehicles: VehicleType[];
    status: string;
    fare: number;
    lat?: number;
    lng?: number;
}

interface SeedUser {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    location: string;
    bio: string;
    verified: boolean;
}

interface SeedPost {
    userId: string;
    title: string;
    tags: string[];
    routes: Route[];
    images: string[];
    startLat?: number;
    startLng?: number;
    endLat?: number;
    endLng?: number;
    waypoints?: Coordinate[];
    region?: string;
    totalDistanceKm?: number;
    estimatedMins?: number;
}

interface SeedComment {
    postId: string;
    userId: string;
    text: string;
}

interface SeedLike {
    userId: string;
    postId: string;
    type: 'LIKE' | 'DISLIKE';
}

interface SeedBookmark {
    userId: string;
    postId: string;
}

async function seedSiteConfig(): Promise<void> {
    console.log('Seeding site configuration...');

    const entries = [
        { key: 'validityConfig', value: DEFAULT_VALIDITY_CONFIG },
        { key: 'feedAlgorithm', value: DEFAULT_FEED_CONFIG },
        { key: 'email', value: DEFAULT_EMAIL_CONFIG },
        { key: 'emailTemplates', value: DEFAULT_EMAIL_TEMPLATES },
    ];

    for (const entry of entries) {
        await prisma.siteConfig.upsert({
            where: { key: entry.key },
            create: { key: entry.key, value: JSON.parse(JSON.stringify(entry.value)) },
            update: { value: JSON.parse(JSON.stringify(entry.value)) },
        });
    }
}

async function seedUsers(): Promise<PrismaUser[]> {
    console.log('Seeding users...');

    const users: SeedUser[] = [
        {
            userName: 'chidi_travels',
            firstName: 'Chidi',
            lastName: 'Okafor',
            email: 'chidi@example.com',
            location: 'Lagos, Nigeria',
            bio: 'Lagos navigator | Public transport expert | Sharing the best routes around Nigeria',
            verified: true,
        },
        {
            userName: 'ada_explorer',
            firstName: 'Ada',
            lastName: 'Nwosu',
            email: 'ada@example.com',
            location: 'Port Harcourt, Nigeria',
            bio: 'Port Harcourt babe | Food & travel | Making Lagos traffic bearable one route at a time',
            verified: true,
        },
        {
            userName: 'emeka_routes',
            firstName: 'Emeka',
            lastName: 'Igwe',
            email: 'emeka@example.com',
            location: 'Abuja, Nigeria',
            bio: 'Abuja resident | Budget traveler | Your guide to affordable trips across Nigeria',
            verified: true,
        },
        {
            userName: 'ngozi_wanderer',
            firstName: 'Ngozi',
            lastName: 'Eze',
            email: 'ngozi@example.com',
            location: 'Enugu, Nigeria',
            bio: 'Coal City explorer | Culture enthusiast | Weekend adventurer',
            verified: false,
        },
        {
            userName: 'tunde_navigator',
            firstName: 'Tunde',
            lastName: 'Adeyemi',
            email: 'tunde@example.com',
            location: 'Ibadan, Nigeria',
            bio: 'Ibadan local | History buff | Documenting ancient routes',
            verified: true,
        },
        {
            userName: 'zainab_traveler',
            firstName: 'Zainab',
            lastName: 'Musa',
            email: 'zainab@example.com',
            location: 'Kano, Nigeria',
            bio: 'Northern Nigeria guide | Cultural tourism advocate',
            verified: false,
        },
        {
            userName: 'bola_roadtrip',
            firstName: 'Bola',
            lastName: 'Williams',
            email: 'bola@example.com',
            location: 'Calabar, Nigeria',
            bio: 'Road trip enthusiast | Carnival lover | Beach bum',
            verified: true,
        },
        {
            userName: 'ifeanyi_budget',
            firstName: 'Ifeanyi',
            lastName: 'Okonkwo',
            email: 'ifeanyi@example.com',
            location: 'Owerri, Nigeria',
            bio: 'Budget travel expert | Student traveler | Sharing affordable routes',
            verified: false,
        },
        {
            userName: 'amina_explorer',
            firstName: 'Amina',
            lastName: 'Bello',
            email: 'amina@example.com',
            location: 'Kaduna, Nigeria',
            bio: 'Adventure seeker | Mountain lover | Hiking enthusiast',
            verified: true,
        },
        {
            userName: 'john_doe',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            location: 'Lagos, Nigeria',
            bio: 'Tech enthusiast | Weekend explorer | Learning the ropes',
            verified: false,
        },
    ];

    const createdUsers: PrismaUser[] = [];
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
        console.log(`Created user: ${user.userName}`);
    }

    return createdUsers;
}

async function seedFollows(users: PrismaUser[]): Promise<void> {
    console.log('Seeding follow relationships...');

    // Create a network of follows
    const follows: [number, number][] = [
        [0, 1], [0, 2], [0, 4], [0, 6], // Chidi follows Ada, Emeka, Tunde, Bola
        [1, 0], [1, 2], [1, 3], [1, 7], // Ada follows Chidi, Emeka, Ngozi, Ifeanyi
        [2, 0], [2, 1], [2, 4], [2, 8], // Emeka follows Chidi, Ada, Tunde, Amina
        [3, 0], [3, 4], [3, 5], // Ngozi follows Chidi, Tunde, Zainab
        [4, 0], [4, 1], [4, 2], // Tunde follows Chidi, Ada, Emeka
        [5, 2], [5, 8], // Zainab follows Emeka, Amina
        [6, 0], [6, 1], [6, 3], // Bola follows Chidi, Ada, Ngozi
        [7, 0], [7, 1], [7, 2], [7, 4], // Ifeanyi follows Chidi, Ada, Emeka, Tunde
        [8, 2], [8, 5], // Amina follows Emeka, Zainab
        [9, 0], [9, 1], [9, 2], [9, 4], [9, 7], // John follows Chidi, Ada, Emeka, Tunde, Ifeanyi
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

    console.log(`Created ${follows.length} follow relationships`);
}

async function seedPosts(users: PrismaUser[]): Promise<any[]> {
    console.log('Seeding posts...');

    const posts: SeedPost[] = [
        {
            userId: users[0].id, // Chidi
            title: 'Best Route from Ikeja to Victoria Island - Beat the Traffic!',
            tags: ['lagos', 'ikeja', 'vi', 'brt', 'traffic-hack', 'daily-commute'],
            routes: [
                {
                    id: '1',
                    text: 'Start at Ikeja Bus Stop. Take a BRT bus heading towards CMS. The dedicated lane saves you from go-slow! Fare: ₦300',
                    links: [{ text: 'BRT Lagos Route Map', url: 'https://www.primerolagos.com' }],
                    order: 0,
                    vehicles: ['bus' as VehicleType],
                    status: 'verified',
                    fare: 300,
                },
                {
                    id: '2',
                    text: 'Stop at Obalende. From there, hop on a yellow danfo or keke to VI. Keke is faster but costs ₦200, danfo is ₦150.',
                    links: [],
                    order: 1,
                    vehicles: ['bus' as VehicleType, 'keke' as VehicleType],
                    status: 'unverified',
                    fare: 200,
                },
                {
                    id: '3',
                    text: 'Get off at Adeola Odeku. If you\'re going to Lekki Phase 1, take another keke for ₦150. Total time: 45 mins (off-peak)',
                    links: [{ text: 'Google Maps - VI', url: 'https://maps.google.com' }],
                    order: 2,
                    vehicles: ['keke' as VehicleType],
                    status: 'verified',
                    fare: 150,
                },
            ],
            images: [
                'https://images.unsplash.com/photo-1590674899484-d5640d0f7b1f?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1569517822092-81d3a7f90e9b?w=600&h=400&fit=crop',
            ],
            startLat: 6.6059,
            startLng: 3.3494,
            endLat: 6.4281,
            endLng: 3.4193,
            waypoints: [
                { lat: 6.5244, lng: 3.3742 },
                { lat: 6.4689, lng: 3.3915 },
                { lat: 6.4356, lng: 3.4061 },
            ],
            region: 'Lagos',
            totalDistanceKm: 12.5,
            estimatedMins: 45,
        },
        {
            userId: users[1].id, // Ada
            title: 'Weekend Trip: Lagos to Ibadan via Public Transport',
            tags: ['lagos', 'ibadan', 'interstate', 'weekend-trip', 'budget-travel'],
            routes: [
                {
                    id: '1',
                    text: 'Head to Ojota Motor Park early morning (before 7 AM to avoid crowd). Look for ABC Transport or GUO buses. Fare: ₦2,500 - ₦3,000',
                    links: [{ text: 'ABC Transport Schedule', url: 'https://abctransport.com' }],
                    order: 0,
                    vehicles: ['bus' as VehicleType],
                    status: 'verified',
                    fare: 2500,
                },
                {
                    id: '2',
                    text: 'Journey takes 2-3 hours depending on traffic. Bus has AC and makes one stop at Sagamu. Bring snacks and water!',
                    links: [],
                    order: 1,
                    vehicles: ['bus' as VehicleType],
                    status: 'pending',
                    fare: 0,
                },
                {
                    id: '3',
                    text: 'Arrive at Iwo Road Terminal in Ibadan. From there, take okada (₦200) or keke (₦150) to Dugbe Market or UI if visiting campus.',
                    links: [{ text: 'Things to do in Ibadan', url: 'https://www.google.com/travel/things-to-do/see-all?dest_mid=%2Fm%2F0fnky' }],
                    order: 2,
                    vehicles: ['bike' as VehicleType, 'keke' as VehicleType],
                    status: 'verified',
                    fare: 150,
                },
            ],
            images: [
                'https://images.unsplash.com/photo-1569517822092-81d3a7f90e9b?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1590674899484-d5640d0f7b1f?w=600&h=400&fit=crop',
            ],
            startLat: 6.6059,
            startLng: 3.3494,
            endLat: 7.3775,
            endLng: 3.9470,
            waypoints: [
                { lat: 6.7281, lng: 3.5089 },
                { lat: 6.8932, lng: 3.6348 },
                { lat: 7.1435, lng: 3.8315 },
            ],
            region: 'Lagos-Ibadan',
            totalDistanceKm: 145,
            estimatedMins: 150,
        },
        {
            userId: users[2].id, // Emeka
            title: 'Navigating Abuja: Kubwa to Wuse Market Route',
            tags: ['abuja', 'kubwa', 'wuse', 'market', 'daily-commute'],
            routes: [
                {
                    id: '1',
                    text: 'Start from Kubwa Phase 4. Take a keke to Kubwa main junction (₦100). Plenty of kekes available from 6 AM.',
                    links: [],
                    order: 0,
                    vehicles: ['keke' as VehicleType],
                    status: 'verified',
                    fare: 100,
                },
                {
                    id: '2',
                    text: 'At the junction, board a taxi or bus going to Berger Roundabout. Fare: ₦300 (shared taxi) or ₦200 (bus)',
                    links: [],
                    order: 1,
                    vehicles: ['taxi' as VehicleType, 'bus' as VehicleType],
                    status: 'verified',
                    fare: 300,
                },
                {
                    id: '3',
                    text: 'From Berger, take another bus directly to Wuse Market. Fare: ₦150. Total journey: 40-50 minutes depending on traffic.',
                    links: [{ text: 'Wuse Market Guide', url: 'https://www.google.com/maps/place/Wuse+Market' }],
                    order: 2,
                    vehicles: ['bus' as VehicleType],
                    status: 'verified',
                    fare: 150,
                },
            ],
            images: [
                'https://images.unsplash.com/photo-1590674899484-d5640d0f7b1f?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1569517822092-81d3a7f90e9b?w=600&h=400&fit=crop',
            ],
            startLat: 9.1584,
            startLng: 7.3240,
            endLat: 9.0559,
            endLng: 7.4891,
            waypoints: [
                { lat: 9.1268, lng: 7.3520 },
                { lat: 9.0872, lng: 7.4125 },
                { lat: 9.0689, lng: 7.4521 },
            ],
            region: 'Abuja',
            totalDistanceKm: 18,
            estimatedMins: 45,
        },
        {
            userId: users[4].id, // Tunde
            title: 'Lagos to Abuja: The Ultimate Road Trip Guide',
            tags: ['roadtrip', 'adventure', 'longdistance', 'lagos', 'abuja'],
            routes: [
                {
                    id: '1',
                    text: 'Start from Ikeja City Mall early morning. Get your coffee and snacks for the journey. Fuel up!',
                    links: [{ text: 'Ikeja City Mall', url: 'https://maps.google.com' }],
                    order: 0,
                    vehicles: ['car' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '2',
                    text: 'Take Lagos-Ibadan Expressway. Stop at Redemption Camp for restroom break. Road is good but watch for trailers.',
                    links: [],
                    order: 1,
                    vehicles: ['car' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '3',
                    text: 'Continue through Ibadan to Osogbo. Stop at a local restaurant for lunch. Try amala and ewedu!',
                    links: [],
                    order: 2,
                    vehicles: ['car' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '4',
                    text: 'Final stretch to Abuja via Lokoja. Amazing views of River Niger bridge! Total time: 8-10 hours with stops.',
                    links: [{ text: 'Niger Bridge View', url: 'https://maps.google.com' }],
                    order: 3,
                    vehicles: ['car' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
            ],
            images: [
                'https://images.unsplash.com/photo-1469854523086-cc02fe5bbc80?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop',
            ],
            startLat: 6.6059,
            startLng: 3.3494,
            endLat: 9.0765,
            endLng: 7.3986,
            waypoints: [
                { lat: 7.1023, lng: 3.6382 },
                { lat: 7.7823, lng: 4.5732 },
                { lat: 8.0751, lng: 5.2518 },
                { lat: 8.4291, lng: 5.9318 },
            ],
            region: 'Lagos-Abuja',
            totalDistanceKm: 750,
            estimatedMins: 540,
        },
        {
            userId: users[3].id, // Ngozi
            title: 'Enugu: Coal City Historical Walking Tour',
            tags: ['enugu', 'culture', 'history', 'walking', 'tourism'],
            routes: [
                {
                    id: '1',
                    text: 'Start at National Museum Enugu. Learn about coal mining history. Entry fee: ₦500',
                    links: [{ text: 'National Museum Enugu', url: 'https://maps.google.com' }],
                    order: 0,
                    vehicles: ['trekking' as VehicleType],
                    status: 'verified',
                    fare: 500,
                },
                {
                    id: '2',
                    text: 'Walk to Okpara Square (15 mins). Great spot for photos and local snacks. Try the suya!',
                    links: [],
                    order: 1,
                    vehicles: ['trekking' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '3',
                    text: 'End at Polo Park Mall for lunch and shopping. Take keke back to your location (₦200).',
                    links: [],
                    order: 2,
                    vehicles: ['trekking' as VehicleType, 'keke' as VehicleType],
                    status: 'verified',
                    fare: 200,
                },
            ],
            images: [
                'https://images.unsplash.com/photo-1596179576071-c668e4a16a15?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1582062311609-f319eb5b4c06?w=600&h=400&fit=crop',
            ],
            startLat: 6.4511,
            startLng: 7.5022,
            endLat: 6.4493,
            endLng: 7.5098,
            waypoints: [
                { lat: 6.4505, lng: 7.5045 },
                { lat: 6.4497, lng: 7.5068 },
            ],
            region: 'Enugu',
            totalDistanceKm: 1.2,
            estimatedMins: 20,
        },
        {
            userId: users[6].id, // Bola
            title: 'Calabar Carnival Route: Best Viewing Spots',
            tags: ['calabar', 'carnival', 'festival', 'tourism', 'december'],
            routes: [
                {
                    id: '1',
                    text: 'Start at Eleven-Eleven Roundabout early (by 9 AM). This is the parade starting point. Come prepared with water!',
                    links: [{ text: 'Calabar Carnival Info', url: 'https://calabarcarnival.com' }],
                    order: 0,
                    vehicles: ['trekking' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '2',
                    text: 'Follow parade route to Marian Road. Great viewing spots with food vendors. Security is tight, stay alert.',
                    links: [],
                    order: 1,
                    vehicles: ['trekking' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '3',
                    text: 'End at U.J. Esuene Stadium for main performances. Entry is free but arrive early for good spots.',
                    links: [],
                    order: 2,
                    vehicles: ['trekking' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
            ],
            images: [
                'https://images.unsplash.com/photo-1614030374535-2348fc420828?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1534430480872-3498386e6b44?w=600&h=400&fit=crop',
            ],
            startLat: 4.9751,
            startLng: 8.3402,
            endLat: 4.9749,
            endLng: 8.3377,
            waypoints: [
                { lat: 4.9753, lng: 8.3391 },
                { lat: 4.9750, lng: 8.3384 },
            ],
            region: 'Cross River',
            totalDistanceKm: 2,
            estimatedMins: 30,
        },
        {
            userId: users[7].id, // Ifeanyi
            title: 'Budget Trip: Owerri to Port Harcourt',
            tags: ['owerri', 'portharcourt', 'budget-travel', 'interstate', 'student'],
            routes: [
                {
                    id: '1',
                    text: 'Go to Owerri Main Park. Take a bus to Port Harcourt. Fare: ₦1,500. Ask for direct buses, not those stopping everywhere.',
                    links: [],
                    order: 0,
                    vehicles: ['bus' as VehicleType],
                    status: 'verified',
                    fare: 1500,
                },
                {
                    id: '2',
                    text: 'Journey takes 1.5-2 hours. You\'ll arrive at Mile 1 or Mile 3 Park in Port Harcourt.',
                    links: [],
                    order: 1,
                    vehicles: ['bus' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '3',
                    text: 'From the park, take keke to your destination. Fare varies ₦100-₦300 depending on distance.',
                    links: [],
                    order: 2,
                    vehicles: ['keke' as VehicleType],
                    status: 'verified',
                    fare: 200,
                },
            ],
            images: [
                'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=600&h=400&fit=crop',
            ],
            startLat: 5.4776,
            startLng: 7.0138,
            endLat: 4.7777,
            endLng: 7.0133,
            waypoints: [
                { lat: 5.3245, lng: 7.0136 },
                { lat: 5.1123, lng: 7.0135 },
                { lat: 4.9456, lng: 7.0134 },
            ],
            region: 'Rivers',
            totalDistanceKm: 88,
            estimatedMins: 120,
        },
        {
            userId: users[5].id, // Zainab
            title: 'Exploring Kano: From Dala Hill to Kurmi Market',
            tags: ['kano', 'culture', 'history', 'market', 'northern-nigeria'],
            routes: [
                {
                    id: '1',
                    text: 'Start at Dala Hill, one of Kano\'s oldest settlements. Climb for panoramic city views. Go early morning to avoid heat!',
                    links: [{ text: 'Dala Hill History', url: 'https://en.wikipedia.org/wiki/Dala_Hill' }],
                    order: 0,
                    vehicles: ['trekking' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
                {
                    id: '2',
                    text: 'Take okada or keke to Gidan Makama Museum (₦200). Learn about Kano\'s rich history and see traditional artifacts.',
                    links: [],
                    order: 1,
                    vehicles: ['bike' as VehicleType, 'keke' as VehicleType],
                    status: 'verified',
                    fare: 200,
                },
                {
                    id: '3',
                    text: 'End at Kurmi Market, one of Africa\'s oldest markets. Perfect for buying traditional crafts. Bargain well!',
                    links: [{ text: 'Kurmi Market Guide', url: 'https://maps.google.com' }],
                    order: 2,
                    vehicles: ['trekking' as VehicleType],
                    status: 'verified',
                    fare: 0,
                },
            ],
            images: [
                'https://images.unsplash.com/photo-1553440569-bcc63803a83f?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=600&h=400&fit=crop',
            ],
            startLat: 12.0022,
            startLng: 8.5193,
            endLat: 12.0013,
            endLng: 8.5155,
            waypoints: [
                { lat: 12.0019, lng: 8.5180 },
                { lat: 12.0015, lng: 8.5165 },
            ],
            region: 'Kano',
            totalDistanceKm: 1.5,
            estimatedMins: 15,
        },
        {
            userId: users[8].id, // Amina
            title: 'Kaduna to Jos: Mountain Adventure',
            tags: ['kaduna', 'jos', 'adventure', 'mountains', 'hiking'],
            routes: [
                {
                    id: '1',
                    text: 'Depart from Rigasa Motor Park in Kaduna. Take a bus to Jos. Fare: ₦2,000. Journey takes 3-4 hours through scenic routes.',
                    links: [],
                    order: 0,
                    vehicles: ['bus' as VehicleType],
                    status: 'verified',
                    fare: 2000,
                },
                {
                    id: '2',
                    text: 'Arrive at Bauchi Road Park in Jos. Take taxi to Shere Hills (₦1,500). Perfect spot for hiking and rock climbing.',
                    links: [{ text: 'Shere Hills', url: 'https://maps.google.com' }],
                    order: 1,
                    vehicles: ['taxi' as VehicleType],
                    status: 'verified',
                    fare: 1500,
                },
                {
                    id: '3',
                    text: 'Visit Jos Wildlife Park nearby. Entry: ₦1,000. Don\'t miss the museum! Return to Kaduna same day or stay overnight.',
                    links: [],
                    order: 2,
                    vehicles: ['taxi' as VehicleType],
                    status: 'verified',
                    fare: 1000,
                },
            ],
            images: [
                'https://images.unsplash.com/photo-1534430480872-3498386e6b44?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1469854523086-cc02fe5bbc80?w=600&h=400&fit=crop',
            ],
            startLat: 10.5105,
            startLng: 7.4177,
            endLat: 9.8965,
            endLng: 8.8583,
            waypoints: [
                { lat: 10.3812, lng: 7.4811 },
                { lat: 10.2189, lng: 7.5812 },
                { lat: 10.0423, lng: 7.8531 },
                { lat: 9.9587, lng: 8.3251 },
            ],
            region: 'Plateau',
            totalDistanceKm: 95,
            estimatedMins: 240,
        },
        {
            userId: users[9].id, // John
            title: 'First Timer\'s Guide: Lekki Phase 1 to Ajah',
            tags: ['lagos', 'lekki', 'ajah', 'beginner', 'daily-commute'],
            routes: [
                {
                    id: '1',
                    text: 'From Lekki Phase 1, walk to the main road. Flag down a yellow and black bus heading to Ajah. Fare: ₦200-₦300.',
                    links: [],
                    order: 0,
                    vehicles: ['bus' as VehicleType],
                    status: 'unverified',
                    fare: 250,
                },
                {
                    id: '2',
                    text: 'Alternative: Take Uber/Bolt if it\'s your first time. Costs ₦1,500-₦2,000 but less confusing. Traffic can be heavy!',
                    links: [],
                    order: 1,
                    vehicles: ['car' as VehicleType],
                    status: 'verified',
                    fare: 1500,
                },
            ],
            images: [
                'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop',
            ],
            startLat: 6.4281,
            startLng: 3.5646,
            endLat: 6.4106,
            endLng: 3.5996,
            waypoints: [
                { lat: 6.4238, lng: 3.5741 },
                { lat: 6.4178, lng: 3.5871 },
            ],
            region: 'Lagos',
            totalDistanceKm: 8,
            estimatedMins: 30,
        },
    ];

    const createdPosts: any[] = [];
    for (const postData of posts) {
        const post = await prisma.post.create({
            data: {
                userId: postData.userId,
                title: postData.title,
                tags: postData.tags,
                routes: postData.routes as any,
                images: postData.images,
                likes: Math.floor(Math.random() * 50) + 10,
                dislikes: Math.floor(Math.random() * 5),
                comments: Math.floor(Math.random() * 20),
                bookmarks: Math.floor(Math.random() * 30),
                views: Math.floor(Math.random() * 200) + 50,
                startLat: postData.startLat ?? undefined,
                startLng: postData.startLng ?? undefined,
                endLat: postData.endLat ?? undefined,
                endLng: postData.endLng ?? undefined,
                waypoints: postData.waypoints as any ?? undefined,
                region: postData.region ?? undefined,
                totalDistanceKm: postData.totalDistanceKm ?? undefined,
                estimatedMins: postData.estimatedMins ?? undefined,
            },
        });
        createdPosts.push(post);
        console.log(`Created post: ${post.title}`);
    }

    return createdPosts;
}

async function seedComments(users: PrismaUser[], posts: any[]): Promise<void> {
    console.log('Seeding comments...');

    const comments: SeedComment[] = [
        {
            postId: posts[0].id,
            userId: users[1].id,
            text: 'This route saved my life! Used it yesterday and avoided 2 hours of traffic. Thanks!',
        },
        {
            postId: posts[0].id,
            userId: users[2].id,
            text: 'The keke from Obalende to VI can be ₦250 during rush hour o. But still faster than sitting in traffic!',
        },
        {
            postId: posts[1].id,
            userId: users[0].id,
            text: 'GUO is more comfortable than ABC in my experience. But both are good options.',
        },
        {
            postId: posts[1].id,
            userId: users[2].id,
            text: 'Pro tip: Book your return ticket immediately you arrive in Ibadan. They fill up fast on Sundays!',
        },
        {
            postId: posts[2].id,
            userId: users[0].id,
            text: 'Abuja traffic is nothing compared to Lagos. But this route is solid!',
        },
        {
            postId: posts[3].id,
            userId: users[1].id,
            text: 'Great guide! I did this trip last month and it was amazing. The Niger Bridge view is breathtaking!',
        },
        {
            postId: posts[3].id,
            userId: users[7].id,
            text: 'How much should I budget for fuel? Planning this trip next month.',
        },
        {
            postId: posts[4].id,
            userId: users[6].id,
            text: 'The museum is really informative. Spent 2 hours there learning about Enugu\'s coal history!',
        },
        {
            postId: posts[5].id,
            userId: users[1].id,
            text: 'Calabar carnival is the best! Been going for 3 years now. This route guide is spot on!',
        },
        {
            postId: posts[6].id,
            userId: users[9].id,
            text: 'As a student, this helps a lot. Saved ₦1,000 compared to taking a taxi!',
        },
        {
            postId: posts[7].id,
            userId: users[2].id,
            text: 'Kurmi Market is amazing! Got beautiful fabrics there. Bargaining is a must though.',
        },
        {
            postId: posts[8].id,
            userId: users[5].id,
            text: 'Jos weather is so cool compared to Lagos. Perfect for hiking!',
        },
        {
            postId: posts[8].id,
            userId: users[4].id,
            text: 'Don\'t forget to try the Irish potatoes when you get to Jos. They\'re famous for a reason!',
        },
        {
            postId: posts[9].id,
            userId: users[0].id,
            text: 'Welcome to Lagos! The public transport can be confusing at first but you\'ll get used to it.',
        },
        {
            postId: posts[9].id,
            userId: users[6].id,
            text: 'If you\'re taking the bus, make sure to hold your phone tight. Pickpockets are real in Lagos traffic!',
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
        console.log(`Created comment on post ${comment.postId}`);
    }
}

async function seedLikes(users: PrismaUser[], posts: any[]): Promise<void> {
    console.log('Seeding likes...');

    const likes: SeedLike[] = [
        { userId: users[0].id, postId: posts[1].id, type: 'LIKE' },
        { userId: users[0].id, postId: posts[2].id, type: 'LIKE' },
        { userId: users[0].id, postId: posts[5].id, type: 'LIKE' },
        { userId: users[1].id, postId: posts[0].id, type: 'LIKE' },
        { userId: users[1].id, postId: posts[3].id, type: 'LIKE' },
        { userId: users[1].id, postId: posts[7].id, type: 'LIKE' },
        { userId: users[2].id, postId: posts[0].id, type: 'LIKE' },
        { userId: users[2].id, postId: posts[4].id, type: 'LIKE' },
        { userId: users[2].id, postId: posts[8].id, type: 'LIKE' },
        { userId: users[3].id, postId: posts[2].id, type: 'LIKE' },
        { userId: users[3].id, postId: posts[4].id, type: 'LIKE' },
        { userId: users[4].id, postId: posts[1].id, type: 'LIKE' },
        { userId: users[4].id, postId: posts[3].id, type: 'LIKE' },
        { userId: users[4].id, postId: posts[6].id, type: 'DISLIKE' },
        { userId: users[5].id, postId: posts[7].id, type: 'LIKE' },
        { userId: users[5].id, postId: posts[8].id, type: 'LIKE' },
        { userId: users[6].id, postId: posts[5].id, type: 'LIKE' },
        { userId: users[6].id, postId: posts[9].id, type: 'LIKE' },
        { userId: users[7].id, postId: posts[0].id, type: 'LIKE' },
        { userId: users[7].id, postId: posts[6].id, type: 'LIKE' },
        { userId: users[8].id, postId: posts[2].id, type: 'LIKE' },
        { userId: users[8].id, postId: posts[8].id, type: 'LIKE' },
        { userId: users[9].id, postId: posts[0].id, type: 'LIKE' },
        { userId: users[9].id, postId: posts[1].id, type: 'DISLIKE' },
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

    console.log(`Created ${likes.length} likes`);
}

async function seedBookmarks(users: PrismaUser[], posts: any[]): Promise<void> {
    console.log('Seeding bookmarks...');

    const bookmarks: SeedBookmark[] = [
        { userId: users[0].id, postId: posts[1].id },
        { userId: users[0].id, postId: posts[3].id },
        { userId: users[0].id, postId: posts[5].id },
        { userId: users[1].id, postId: posts[0].id },
        { userId: users[1].id, postId: posts[2].id },
        { userId: users[2].id, postId: posts[0].id },
        { userId: users[2].id, postId: posts[4].id },
        { userId: users[3].id, postId: posts[1].id },
        { userId: users[3].id, postId: posts[4].id },
        { userId: users[4].id, postId: posts[1].id },
        { userId: users[4].id, postId: posts[3].id },
        { userId: users[5].id, postId: posts[7].id },
        { userId: users[6].id, postId: posts[5].id },
        { userId: users[7].id, postId: posts[0].id },
        { userId: users[7].id, postId: posts[6].id },
        { userId: users[8].id, postId: posts[8].id },
        { userId: users[9].id, postId: posts[0].id },
        { userId: users[9].id, postId: posts[9].id },
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

    console.log(`Created ${bookmarks.length} bookmarks`);
}

async function main() {
    console.log('Starting database seeding...\n');

    try {
        // Ensure waypoints column exists (safe to run if already present)
        await prisma.$executeRawUnsafe(
            'ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "waypoints" JSONB',
        );
        console.log('  → Verified waypoints column exists\n');

        await seedSiteConfig();
        const users = await seedUsers();
        await seedFollows(users);
        const posts = await seedPosts(users);
        await seedComments(users, posts);
        await seedLikes(users, posts);
        await seedBookmarks(users, posts);

        console.log('\nDatabase seeded successfully!');
        console.log('\nSeed Summary:');
        console.log(`   Users:     ${users.length}`);
        console.log(`   Posts:     ${posts.length}`);
        console.log('   Comments:  15');
        console.log('   Likes:     24');
        console.log('   Bookmarks: 18');
        console.log('   Follows:   22');
        console.log('\nDefault password for all users: Password123!');
        console.log('\nTest Accounts:');
        console.log('   chidi@example.com    - Lagos expert');
        console.log('   ada@example.com      - Port Harcourt traveler');
        console.log('   emeka@example.com    - Abuja navigator');
        console.log('   john.doe@example.com - New user');
    } catch (error) {
        console.error('Seeding failed:', error);
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

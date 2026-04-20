import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { cache } from '@/lib/cache/redis';
import { rateLimitByIP } from '@/lib/utils/rateLimiter';
import { validateRegisterData } from '@/lib/utils/validation';
import bcrypt from 'bcryptjs';

// In-memory OTP storage (in production, use Redis or similar)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        // Rate limit check (10 registrations per hour per IP)
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimit = await rateLimitByIP(clientIP, { maxRequests: 10, windowSeconds: 3600 });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.reset) }
                }
            );
        }

        const body: RegisterData = await request.json();

        // Validate input data
        const validation = validateRegisterData(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0]?.message || 'Invalid input data' },
                { status: 400 }
            );
        }

        const { userName, firstName, lastName, email, password } = body;

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });

        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUserName = await prisma.user.findUnique({
            where: { userName },
            select: { id: true }
        });

        if (existingUserName) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            );
        }

        // Hash password with bcrypt (12 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                userName,
                firstName,
                lastName,
                email,
                password: hashedPassword,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
                bio: '',
                verified: false // User must verify via OTP
            },
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                bio: true,
                verified: true,
                location: true,
                createdAt: true
            }
        });

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store OTP in cache (10 minute TTL)
        await cache.set(`otp:${email}`, JSON.stringify({ code: otpCode, expiresAt }), 600);
        otpStore.set(email, { code: otpCode, expiresAt }); // Keep in-memory fallback

        // Log OTP for testing (in production, send via email/SMS)
        console.log(`OTP for ${email}: ${otpCode}`);

        return NextResponse.json({
            message: 'User registered successfully. Verification code sent to your email.',
            user: {
                id: newUser.id,
                userName: newUser.userName,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}

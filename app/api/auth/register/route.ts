import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

// In-memory OTP storage (in production, use Redis or similar)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const body: RegisterData = await request.json();
        const { userName, firstName, lastName, email, password } = body;

        // Validate required fields
        if (!userName || !firstName || !lastName || !email || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingEmail = await db.getUserByEmail(email);
        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUserName = await db.getUserByUserName(userName);
        if (existingUserName) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            );
        }

        // Create new user
        const newUser = await db.createUser({
            userName,
            firstName,
            lastName,
            email,
            password, // Note: In production, hash password with bcrypt
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
            bio: '',
        });

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        otpStore.set(email, { code: otpCode, expiresAt });

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

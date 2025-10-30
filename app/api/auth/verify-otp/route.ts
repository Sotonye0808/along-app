import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

// Import the same OTP store from register route
// In production, use a shared cache like Redis
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
    try {
        const body: OtpVerification = await request.json();
        const { email, code } = body;

        // Validate required fields
        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and code are required' },
                { status: 400 }
            );
        }

        // Get stored OTP
        const storedOTP = otpStore.get(email);

        if (!storedOTP) {
            return NextResponse.json(
                { error: 'No verification code found for this email' },
                { status: 400 }
            );
        }

        // Check if OTP expired
        if (Date.now() > storedOTP.expiresAt) {
            otpStore.delete(email);
            return NextResponse.json(
                { error: 'Verification code has expired' },
                { status: 400 }
            );
        }

        // Verify OTP
        if (code !== storedOTP.code) {
            return NextResponse.json(
                { error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Mark user as verified
        const user = await db.getUserByEmail(email);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        await db.updateUser(user.id, { verified: true });

        // Clear OTP
        otpStore.delete(email);

        return NextResponse.json({
            message: 'Account verified successfully',
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        return NextResponse.json(
            { error: 'Verification failed. Please try again.' },
            { status: 500 }
        );
    }
}

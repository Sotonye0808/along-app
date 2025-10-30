import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
    try {
        const users = await db.getUsers();

        // Remove sensitive data (password)
        const sanitizedUsers = users.map(({ password, ...user }) => user);

        return NextResponse.json(sanitizedUsers, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Check if user already exists
        const existingEmail = await db.getUserByEmail(body.email);
        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        const existingUserName = await db.getUserByUserName(body.userName);
        if (existingUserName) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            );
        }

        const newUser = await db.createUser(body);

        // Remove password from response
        const { password, ...sanitizedUser } = newUser;

        return NextResponse.json(sanitizedUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}

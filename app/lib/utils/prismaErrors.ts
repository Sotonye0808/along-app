import { NextResponse } from 'next/server';
import { Prisma } from '@/app/generated/prisma/client';

export function handlePrismaError(error: unknown, resource: string): NextResponse | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    if (error.code === 'P2025') {
        return NextResponse.json(
            { error: `${resource} not found` },
            { status: 404 }
        );
    }

    if (error.code === 'P2002') {
        return NextResponse.json(
            { error: `${resource} conflicts with an existing record` },
            { status: 409 }
        );
    }

    return NextResponse.json(
        { error: 'Database request failed' },
        { status: 400 }
    );
}

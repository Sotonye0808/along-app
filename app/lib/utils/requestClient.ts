import { NextRequest } from 'next/server';

function normalizeIdentifier(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 120);
}

export function getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        const firstIP = forwardedFor.split(',')[0]?.trim();
        if (firstIP) {
            return firstIP;
        }
    }

    const realIP = request.headers.get('x-real-ip')?.trim();
    if (realIP) {
        return realIP;
    }

    return 'unknown';
}

export function getAuthRateLimitIdentifier(
    request: NextRequest,
    authIdentifier?: string,
): string {
    const ip = getClientIP(request);
    const ua = normalizeIdentifier(request.headers.get('user-agent') || 'unknown-agent');
    const normalizedAuthIdentifier = normalizeIdentifier(authIdentifier || 'anonymous');

    return `${ip}:${normalizedAuthIdentifier}:${ua}`;
}

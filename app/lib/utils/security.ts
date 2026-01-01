/**
 * Security Utilities
 * 
 * Security helpers for password hashing, input sanitization, token generation,
 * and other security-related operations.
 */

import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================================================
// Password Security
// ============================================================================

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Higher than minimum 10 for better security
    return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches hash
 */
export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitize text input to prevent XSS attacks
 * @param text - Raw text input
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
}

/**
 * Sanitize HTML content (for rich text)
 * Allows only safe HTML tags
 * @param html - Raw HTML content
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
    // Remove potentially dangerous tags
    const dangerousTags = [
        'script',
        'iframe',
        'object',
        'embed',
        'link',
        'style',
        'meta',
        'base',
    ];

    let sanitized = html;
    dangerousTags.forEach((tag) => {
        const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
        sanitized = sanitized.replace(regex, '');
        // Also remove self-closing tags
        const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, 'gi');
        sanitized = sanitized.replace(selfClosingRegex, '');
    });

    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
    sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');

    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');

    return sanitized.trim();
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 * @param url - Raw URL
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string): string | null {
    const trimmed = url.trim();

    // Check for dangerous protocols
    if (
        trimmed.toLowerCase().startsWith('javascript:') ||
        trimmed.toLowerCase().startsWith('data:') ||
        trimmed.toLowerCase().startsWith('vbscript:')
    ) {
        return null;
    }

    // Ensure URL starts with http:// or https://
    if (!trimmed.match(/^https?:\/\//i)) {
        return null;
    }

    return trimmed;
}

/**
 * Sanitize username (alphanumeric and underscore only)
 * @param username - Raw username
 * @returns Sanitized username
 */
export function sanitizeUsername(username: string): string {
    return username.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a random token
 * @param length - Token length in bytes (will be hex encoded to 2x length)
 * @returns Random token string
 */
export function generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a random OTP code
 * @param length - OTP length (default 6 digits)
 * @returns OTP code string
 */
export function generateOtp(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }

    return otp;
}

/**
 * Generate a secure random string
 * @param length - String length
 * @param charset - Character set to use
 * @returns Random string
 */
export function generateRandomString(
    length: number = 32,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
    let result = '';
    const bytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
        result += charset[bytes[i] % charset.length];
    }

    return result;
}

// ============================================================================
// CORS Configuration
// ============================================================================

/**
 * CORS headers for API routes
 */
export const corsHeaders = {
    'Access-Control-Allow-Origin':
        process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_APP_URL || '*'
            : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Add CORS headers to response
 * @param response - NextResponse object
 * @returns Response with CORS headers
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    return response;
}

/**
 * Handle CORS preflight requests
 * @returns Response for OPTIONS requests
 */
export function handleCorsPreFlight(): NextResponse {
    const response = NextResponse.json({}, { status: 200 });
    return addCorsHeaders(response);
}

// ============================================================================
// Security Headers
// ============================================================================

/**
 * Security headers for production
 */
export const securityHeaders = {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Content Security Policy
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for Next.js
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "frame-ancestors 'none'",
    ].join('; '),
    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=(self)',
        'interest-cohort=()',
    ].join(', '),
};

/**
 * Add security headers to response
 * @param response - NextResponse object
 * @returns Response with security headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
    if (process.env.NODE_ENV === 'production') {
        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
    }
    return response;
}

// ============================================================================
// Cookie Security
// ============================================================================

/**
 * Cookie options for secure cookies
 */
export const secureCookieOptions = {
    httpOnly: true, // Prevent XSS access to cookies
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict' as const, // CSRF protection
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
};

/**
 * Cookie options for refresh tokens (longer expiry)
 */
export const refreshCookieOptions = {
    ...secureCookieOptions,
    maxAge: 60 * 60 * 24 * 30, // 30 days
};

// ============================================================================
// Error Response Helpers
// ============================================================================

/**
 * Create a secure error response (don't leak sensitive info)
 * @param message - User-friendly error message
 * @param status - HTTP status code
 * @param logMessage - Internal error message for logs
 * @returns NextResponse with error
 */
export function createErrorResponse(
    message: string,
    status: number = 500,
    logMessage?: string
): NextResponse {
    // Log detailed error for debugging (not exposed to client)
    if (logMessage && process.env.NODE_ENV !== 'production') {
        console.error(`[Security Error] ${logMessage}`);
    }

    // Return sanitized error to client
    return NextResponse.json(
        { error: sanitizeText(message) },
        { status }
    );
}

/**
 * Create a success response with security headers
 * @param data - Response data
 * @param status - HTTP status code
 * @returns NextResponse with data and security headers
 */
export function createSuccessResponse(
    data: unknown,
    status: number = 200
): NextResponse {
    const response = NextResponse.json(data, { status });
    return addSecurityHeaders(addCorsHeaders(response));
}

// ============================================================================
// IP Address Utilities
// ============================================================================

/**
 * Get client IP address from request headers
 * @param request - Request object
 * @returns Client IP address
 */
export function getClientIp(request: Request): string {
    // Check common headers (CloudFlare, AWS, etc.)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) {
        return cfIp.trim();
    }

    // Fallback
    return 'unknown';
}

// ============================================================================
// Timing Safe Comparison
// ============================================================================

/**
 * Compare two strings in constant time (prevent timing attacks)
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
export function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    return crypto.timingSafeEqual(bufferA, bufferB);
}

// ============================================================================
// Data Masking
// ============================================================================

/**
 * Mask email address for display
 * @param email - Email address
 * @returns Masked email (e.g., j***@example.com)
 */
export function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;

    const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
    return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number for display
 * @param phone - Phone number
 * @returns Masked phone (e.g., +234***1234)
 */
export function maskPhone(phone: string): string {
    if (phone.length < 8) return phone;

    return phone.slice(0, 4) + '***' + phone.slice(-4);
}

/**
 * Redact sensitive data from logs
 * @param data - Data object
 * @param sensitiveKeys - Keys to redact
 * @returns Data with sensitive fields redacted
 */
export function redactSensitiveData(
    data: Record<string, any>,
    sensitiveKeys: string[] = ['password', 'token', 'secret', 'apiKey']
): Record<string, any> {
    const redacted = { ...data };

    sensitiveKeys.forEach((key) => {
        if (key in redacted) {
            redacted[key] = '[REDACTED]';
        }
    });

    return redacted;
}

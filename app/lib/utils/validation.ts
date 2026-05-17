/**
 * Validation Schemas
 * 
 * Zod schemas for input validation across the application.
 * Ensures data integrity and type safety for API requests.
 */

import { z } from 'zod';

// ============================================================================
// User Validation Schemas
// ============================================================================

export const registerSchema = z.object({
    userName: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    firstName: z.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters'),
    lastName: z.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters'),
    email: z.string()
        .email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
    userName: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .optional(),
    firstName: z.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters')
        .optional(),
    lastName: z.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters')
        .optional(),
    bio: z.string()
        .max(500, 'Bio must be less than 500 characters')
        .optional(),
    location: z.string()
        .max(100, 'Location must be less than 100 characters')
        .optional(),
    avatar: z.string().url('Invalid avatar URL').optional(),
});

export const verifyOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
    code: z.string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d+$/, 'OTP must contain only numbers'),
});

// ============================================================================
// Validation Helper Functions
// ============================================================================

export function validateLoginData(data: unknown) {
    return loginSchema.safeParse(data);
}

export function validateRegisterData(data: unknown) {
    return registerSchema.safeParse(data);
}

// ============================================================================
// Post Validation Schemas
// ============================================================================

export const linkSchema = z.object({
    text: z.string().min(1, 'Link text is required').max(100, 'Link text must be less than 100 characters'),
    url: z.string().url('Invalid URL'),
});

export const routeSchema = z.object({
    id: z.string(),
    text: z.string()
        .min(1, 'Route text is required')
        .max(1000, 'Route text must be less than 1000 characters'),
    links: z.array(linkSchema).max(10, 'Maximum 10 links per route'),
    order: z.number().int().min(0),
    vehicles: z.array(z.string()).min(1, 'At least one vehicle type is required'),
    status: z.enum(['verified', 'unverified', 'pending', 'rejected']),
    fare: z.number().min(0, 'Fare must be a positive number').optional(),
});

export const createPostSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must be less than 200 characters'),
    routes: z.array(routeSchema)
        .min(1, 'At least one route is required')
        .max(20, 'Maximum 20 routes per post'),
    images: z.array(z.string().url('Invalid image URL'))
        .max(10, 'Maximum 10 images per post'),
    tags: z.array(z.string().min(2).max(30))
        .min(1, 'At least one tag is required')
        .max(10, 'Maximum 10 tags per post'),
});

export const updatePostSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must be less than 200 characters')
        .optional(),
    routes: z.array(routeSchema)
        .min(1, 'At least one route is required')
        .max(20, 'Maximum 20 routes per post')
        .optional(),
    images: z.array(z.string().url('Invalid image URL'))
        .max(10, 'Maximum 10 images per post')
        .optional(),
    tags: z.array(z.string().min(2).max(30))
        .min(1, 'At least one tag is required')
        .max(10, 'Maximum 10 tags per post')
        .optional(),
});

// ============================================================================
// Comment Validation Schemas
// ============================================================================

export const createCommentSchema = z.object({
    postId: z.string().cuid('Invalid post ID'),
    text: z.string()
        .min(1, 'Comment cannot be empty')
        .max(1000, 'Comment must be less than 1000 characters'),
});

export const updateCommentSchema = z.object({
    text: z.string()
        .min(1, 'Comment cannot be empty')
        .max(1000, 'Comment must be less than 1000 characters'),
});

// ============================================================================
// Interaction Validation Schemas
// ============================================================================

export const likeSchema = z.object({
    postId: z.string().cuid('Invalid post ID'),
    type: z.enum(['like', 'dislike']),
});

export const bookmarkSchema = z.object({
    postId: z.string().cuid('Invalid post ID'),
});

export const followSchema = z.object({
    userId: z.string().cuid('Invalid user ID'),
});

// ============================================================================
// Search Validation Schemas
// ============================================================================

export const searchSchema = z.object({
    query: z.string()
        .min(1, 'Search query is required')
        .max(100, 'Search query must be less than 100 characters'),
    categories: z.array(z.enum(['users', 'posts', 'tags'])).optional(),
});

// ============================================================================
// Pagination Validation Schemas
// ============================================================================

export const paginationSchema = z.object({
    cursor: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
});

// ============================================================================
// Image Upload Validation
// ============================================================================

export const imageUploadSchema = z.object({
    file: z.instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
        .refine(
            (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
            'Only JPG, PNG, and WebP images are allowed'
        ),
    preset: z.enum(['avatar', 'postImage']),
});

// ============================================================================
// Notification Validation Schemas
// ============================================================================

export const markNotificationReadSchema = z.object({
    notificationId: z.string().cuid('Invalid notification ID'),
});

// ============================================================================
// Type exports from schemas
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type LikeInput = z.infer<typeof likeSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;
export type FollowInput = z.infer<typeof followSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate data against a schema
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validation result with parsed data or errors
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown) {
    try {
        const parsed = schema.parse(data);
        return { success: true as const, data: parsed, errors: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false as const,
                data: null,
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            };
        }
        return {
            success: false as const,
            data: null,
            errors: [{ field: 'unknown', message: 'Validation failed' }],
        };
    }
}

/**
 * Async validation (useful for API routes)
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Promise with validation result
 */
export async function validateAsync<T>(schema: z.ZodSchema<T>, data: unknown) {
    try {
        const parsed = await schema.parseAsync(data);
        return { success: true as const, data: parsed, errors: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false as const,
                data: null,
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            };
        }
        return {
            success: false as const,
            data: null,
            errors: [{ field: 'unknown', message: 'Validation failed' }],
        };
    }
}

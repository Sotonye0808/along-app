/**
 * Cloudinary Utility Functions
 * 
 * Helper functions for image upload, deletion, and validation with Cloudinary.
 */

import cloudinary, { UPLOAD_PRESETS, MAX_FILE_SIZE } from '../config/cloudinary';

/**
 * Upload an image to Cloudinary
 * @param base64Image - Base64 encoded image string
 * @param preset - Upload preset ('avatar' or 'postImage')
 * @returns Cloudinary upload result with URL and public_id
 */
export async function uploadImage(
    base64Image: string,
    preset: 'avatar' | 'postImage'
): Promise<{ url: string; publicId: string }> {
    try {
        const uploadConfig = UPLOAD_PRESETS[preset];

        const result = await cloudinary.uploader.upload(base64Image, {
            folder: uploadConfig.folder,
            transformation: uploadConfig.transformation,
            allowed_formats: uploadConfig.allowed_formats,
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image');
    }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Cloudinary public ID of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image');
    }
}

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of Cloudinary public IDs to delete
 */
export async function deleteImages(publicIds: string[]): Promise<void> {
    try {
        await Promise.all(publicIds.map(id => cloudinary.uploader.destroy(id)));
    } catch (error) {
        console.error('Cloudinary bulk delete error:', error);
        throw new Error('Failed to delete images');
    }
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID or null if invalid URL
 */
export function extractPublicId(url: string): string | null {
    try {
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
        const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        return matches ? matches[1] : null;
    } catch (error) {
        console.error('Failed to extract public ID:', error);
        return null;
    }
}

/**
 * Convert File to base64 string
 * @param file - File object from input
 * @returns Base64 encoded string
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

/**
 * Validate image file before upload
 * @param file - File object to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Only JPG, PNG, and WebP images are allowed',
        };
    }

    return { valid: true };
}

/**
 * Get optimized image URL with transformations
 * @param url - Original Cloudinary URL
 * @param width - Desired width
 * @param height - Desired height
 * @returns Transformed image URL
 */
export function getOptimizedImageUrl(
    url: string,
    width?: number,
    height?: number
): string {
    if (!url.includes('cloudinary.com')) {
        return url; // Not a Cloudinary URL, return as-is
    }

    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push('c_fill', 'q_auto', 'f_auto');

    const transformString = transformations.join(',');
    return url.replace('/upload/', `/upload/${transformString}/`);
}

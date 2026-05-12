/**
 * Cloudinary Configuration
 * 
 * This file contains the Cloudinary configuration for image uploads.
 * Images are stored in the following folders:
 * - along/avatars: User profile pictures
 * - along/posts: Post images
 */

import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryFolderPrefix } from "@/lib/utils/env";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const folderPrefix = getCloudinaryFolderPrefix();

// Upload presets
export const UPLOAD_PRESETS = {
    avatar: {
        folder: `${folderPrefix}/avatars`,
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
        ],
        allowed_formats: ['jpg', 'png', 'webp'],
    },
    postImage: {
        folder: `${folderPrefix}/posts`,
        transformation: [
            { width: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
        ],
        allowed_formats: ['jpg', 'png', 'webp'],
    },
};

// Max file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default cloudinary;

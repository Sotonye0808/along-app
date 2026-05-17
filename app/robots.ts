import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/utils/metadata';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getSiteUrl();

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/otp'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

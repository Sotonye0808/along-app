import type { Metadata } from "next";

export const SITE_NAME = "Along";
export const SITE_DESCRIPTION =
    "Discover and share amazing travel routes with the Along community.";
export const DEFAULT_OG_IMAGE = "/assets/images/og-image.png";

export function getSiteUrl(pathname = ""): string {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
        "http://localhost:3000";

    if (!pathname) {
        return baseUrl;
    }

    return `${baseUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export interface BuildMetadataInput {
    title: string;
    description?: string;
    pathname?: string;
    keywords?: string[];
    type?: "website" | "article" | "profile";
    image?: string;
    card?: "summary" | "summary_large_image";
}

export function buildMetadata({
    title,
    description = SITE_DESCRIPTION,
    pathname = "/",
    keywords = [],
    type = "website",
    image = DEFAULT_OG_IMAGE,
    card = "summary_large_image",
}: BuildMetadataInput): Metadata {
    return {
        title,
        description,
        keywords,
        metadataBase: new URL(getSiteUrl()),
        openGraph: {
            type,
            locale: "en_US",
            url: pathname,
            title,
            description,
            siteName: SITE_NAME,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card,
            title,
            description,
            images: [image],
        },
    };
}
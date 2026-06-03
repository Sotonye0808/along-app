import type { Metadata } from "next";
import { DEFAULT_META } from "@/app/lib/config";

type BuildMetaOptions = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex = false,
}: BuildMetaOptions): Metadata {
  const url = `${DEFAULT_META.url}${path}`;
  const image = ogImage ?? DEFAULT_META.ogImage;

  return {
    metadataBase: new URL(DEFAULT_META.url),
    title: `${title} | Along`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Along`,
      description,
      url,
      siteName: DEFAULT_META.siteName,
      images: [{ url: image, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Along`,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function buildPublicMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return buildMetadata({ title, description, path });
}

export async function buildPostMetadata(
  post: { title: string; createdAt: Date; user?: { firstName: string; userName: string } } | null,
  path: string,
): Promise<Metadata> {
  if (!post) {
    return buildMetadata({
      title: "Post Not Found",
      description: "This post could not be found.",
      path,
      noIndex: true,
    });
  }

  const title = post.title;
  const description = `Route shared by ${post.user?.firstName ?? "a traveler"} - ${post.title}`;

  return {
    title: `${title} | Along`,
    description,
    alternates: { canonical: `${DEFAULT_META.url}${path}` },
    openGraph: {
      title: `${title} | Along`,
      description,
      url: `${DEFAULT_META.url}${path}`,
      siteName: DEFAULT_META.siteName,
      images: [{ url: DEFAULT_META.ogImage, width: 1200, height: 630 }],
      type: "article",
      publishedTime: post.createdAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Along`,
      description,
      images: [DEFAULT_META.ogImage],
    },
  };
}

export async function buildProfileMetadata(
  profile: { firstName: string; lastName: string; userName: string; bio?: string | null } | null,
  path: string,
): Promise<Metadata> {
  if (!profile) {
    return buildMetadata({
      title: "User Not Found",
      description: "This profile could not be found.",
      path,
      noIndex: true,
    });
  }

  const displayName = `${profile.firstName} ${profile.lastName}`;
  const description = profile.bio ?? `${displayName} (@${profile.userName}) on Along. View their shared routes and community reputation.`;

  return {
    title: `${displayName} (@${profile.userName}) | Along`,
    description,
    alternates: { canonical: `${DEFAULT_META.url}${path}` },
    openGraph: {
      title: `${displayName} (@${profile.userName}) | Along`,
      description,
      url: `${DEFAULT_META.url}${path}`,
      siteName: DEFAULT_META.siteName,
      images: [{ url: DEFAULT_META.ogImage, width: 1200, height: 630 }],
      type: "profile",
      username: profile.userName,
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} (@${profile.userName}) | Along`,
      description,
      images: [DEFAULT_META.ogImage],
    },
  };
}

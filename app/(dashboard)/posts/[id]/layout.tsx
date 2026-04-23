import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: postId } = await params;

  try {
    // Fetch post data for metadata
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/posts/${postId}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch post");
    }

    const post = (await response.json()) as Post;

    // Fetch author data
    const authorResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/users/${post.userId}`,
      {
        cache: "no-store",
      },
    );

    const author = authorResponse.ok
      ? ((await authorResponse.json()) as User)
      : null;

    const title = `${post.title} | Along`;
    const description =
      post.routes.length > 0
        ? `${post.routes[0].text.substring(0, 150)}...`
        : `Travel route shared by ${
            author?.firstName || "a traveler"
          } on Along`;

    const imageUrl =
      post.images.length > 0 ? post.images[0] : "/assets/images/og-image.png";

    return {
      title,
      description,
      keywords: ["travel route", "post", "Along", ...post.tags],
      openGraph: {
        title,
        description,
        type: "article",
        url: `/posts/${postId}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        authors: author
          ? [`${author.firstName} ${author.lastName}`]
          : undefined,
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
        creator: author ? `@${author.userName}` : undefined,
      },
    };
  } catch (error) {
    return {
      title: "Post | Along",
      description: "View this travel route shared on Along",
      keywords: ["travel route", "post", "Along"],
      openGraph: {
        title: "Post | Along",
        description: "View this travel route shared on Along",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "Post | Along",
        description: "View this travel route shared on Along",
      },
    };
  }
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

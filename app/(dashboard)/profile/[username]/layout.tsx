import type { Metadata } from "next";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  try {
    // Fetch all users to find the one with matching username
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/users`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = (await response.json()) as User[];
    const user = users.find((u) => u.userName === username);

    if (!user) {
      return {
        title: `@${username} | Along`,
        description: "User profile on Along",
        keywords: ["profile", "user", "Along", username],
      };
    }

    const title = `${user.firstName} ${user.lastName} (@${user.userName})`;
    const description =
      user.bio ||
      `Travel enthusiast sharing routes and experiences on Along. ${
        user.followers || 0
      } followers.`;
    const avatarUrl = user.avatar || "/assets/images/default-avatar.png";

    return {
      title,
      description,
      keywords: [
        "profile",
        "user",
        "Along",
        user.userName,
        user.firstName,
        user.lastName,
      ],
      openGraph: {
        title,
        description,
        type: "profile",
        url: `/profile/${username}`,
        images: [
          {
            url: avatarUrl,
            width: 400,
            height: 400,
            alt: `${user.firstName} ${user.lastName}`,
          },
        ],
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.userName,
      },
      twitter: {
        card: "summary",
        title,
        description,
        images: [avatarUrl],
        creator: `@${user.userName}`,
      },
    };
  } catch (error) {
    return {
      title: `@${username}`,
      description: "User profile on Along",
      keywords: ["profile", "user", "Along", username],
      openGraph: {
        title: `@${username} | Along`,
        description: "User profile on Along",
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: `@${username} | Along`,
        description: "User profile on Along",
      },
    };
  }
}

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

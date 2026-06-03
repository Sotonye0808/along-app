import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/contact", "/privacy", "/terms", "/explore"],
        disallow: ["/admin", "/api", "/login", "/register", "/otp", "/home", "/bookmarks", "/notifications", "/profile/", "/posts/"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://along.app"}/sitemap.xml`,
  };
}

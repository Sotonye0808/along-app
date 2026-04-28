import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db/prisma";
import { cache, CACHE_KEYS } from "@/lib/cache/redis";
import { APP_ROUTES } from "@/lib/constants";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<GoogleTokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  return res.json() as Promise<GoogleTokenResponse>;
}

async function fetchGoogleUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return res.json() as Promise<GoogleUserInfo>;
}

function generateUniqueUsername(base: string): string {
  const sanitized = base.toLowerCase().replace(/[^a-z0-9]/g, "");
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `${sanitized.slice(0, 16)}${suffix}`;
}

/**
 * GET /api/auth/google/callback
 * Handles the OAuth callback from Google: exchanges code for tokens,
 * upserts the user, issues Along JWT, sets cookies, then redirects.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const loginUrl = new URL("/login", request.url);

  if (error || !code) {
    loginUrl.searchParams.set("error", error ?? "oauth_cancelled");
    return NextResponse.redirect(loginUrl);
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (
    !redirectUri ||
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET
  ) {
    loginUrl.searchParams.set("error", "oauth_not_configured");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const googleUser = await fetchGoogleUserInfo(tokens.access_token);

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.sub }, { email: googleUser.email }],
      },
    });

    if (!user) {
      const baseUsername =
        googleUser.given_name || googleUser.email.split("@")[0];
      const userName = generateUniqueUsername(baseUsername);

      user = await prisma.user.create({
        data: {
          googleId: googleUser.sub,
          email: googleUser.email,
          firstName: googleUser.given_name || googleUser.name.split(" ")[0],
          lastName:
            googleUser.family_name ||
            googleUser.name.split(" ").slice(1).join(" ") ||
            "",
          userName,
          password: "",
          avatar: googleUser.picture,
          verified: googleUser.email_verified,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          avatar: user.avatar ?? googleUser.picture,
          verified: googleUser.email_verified,
        },
      });
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    await cache.del(CACHE_KEYS.userProfile(user.id));

    const dashboardUrl = new URL(APP_ROUTES.DASHBOARD, request.url);
    const response = NextResponse.redirect(dashboardUrl);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60,
    });
    response.cookies.set("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    loginUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(loginUrl);
  }
}

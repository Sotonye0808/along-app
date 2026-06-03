import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isExactPath(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(route + "/");
}

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Guest-accessible: public pages + feed, explore, profiles, posts, faq, blog
  const guestRoutes = [
    "/", "/about", "/contact", "/privacy", "/terms", "/report-bug",
    "/faq", "/blog", "/home", "/explore",
  ];
  if (guestRoutes.some((r) => isExactPath(pathname, r))) {
    return NextResponse.next();
  }
  // Profile sub-routes (e.g. /profile/username) are guest-accessible but /profile (own) is protected
  if (pathname.startsWith("/profile/") && pathname !== "/profile") {
    return NextResponse.next();
  }
  // Post detail pages are guest-accessible
  if (pathname.startsWith("/posts/")) {
    return NextResponse.next();
  }

  // Auth routes: redirect to home if already logged in
  if (["/login", "/register", "/otp"].some((r) => pathname.startsWith(r))) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes: require auth
  const protectedRoutes = [
    "/bookmarks", "/notifications", "/analytics", "/invite", "/admin", "/profile",
  ];
  if (protectedRoutes.some((r) => isExactPath(pathname, r))) {
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const hasPhone = !!req.auth?.user?.phone;

  const publicPaths = ["/login"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathname === "/login") {
    const destination = hasPhone ? "/calendar" : "/profile";
    return NextResponse.redirect(new URL(destination, req.nextUrl.origin));
  }

  if (isLoggedIn && !hasPhone && pathname !== "/profile") {
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/profile", req.nextUrl.origin));
    }
  }

  if (isLoggedIn && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/profile", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};

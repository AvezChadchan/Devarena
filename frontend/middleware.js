import { NextResponse } from "next/server";

export function middleware(request) {
  console.log("Middleware running for:", request.nextUrl.pathname);

  const token = request.cookies.get("accessToken")?.value;

  console.log("Token found:", !!token); // true/false

  // Protected paths (add more as needed)
  const protectedPaths = ["/dashboard", "/contest", "/problem", "/profile"];

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    console.log("No token → redirecting to /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/contest/:path*",
    "/problem/:path*",
    "/profile/:path*",
  ],
};

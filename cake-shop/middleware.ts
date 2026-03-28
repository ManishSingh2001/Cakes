import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiAdminRoute = pathname.startsWith("/api/admin");
  const isUserRoute =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/order-success");
  const isApiUserRoute = pathname.startsWith("/api/user");
  const isLoginPage = pathname === "/login" || pathname === "/admin/login";
  const isRegisterPage = pathname === "/register";
  const isRegisterApi = pathname.startsWith("/api/user/register");

  // Allow login, register pages and register API
  if (isLoginPage || isRegisterPage || isRegisterApi) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Protect admin routes
  if (isAdminRoute || isApiAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "admin" && token.role !== "superadmin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect user routes
  if (isUserRoute || isApiUserRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/profile/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/order-success/:path*",
    "/api/user/:path*",
  ],
};

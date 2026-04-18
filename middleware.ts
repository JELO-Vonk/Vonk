import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_PREFIXES = ["/dashboard", "/discover", "/likes", "/matches", "/chats", "/live", "/visitors", "/premium", "/settings", "/verify", "/blocked", "/reports"];
const ADMIN_PREFIX = "/admin";

function hasSession(req: NextRequest) {
  return Boolean(req.cookies.get("vonk_session")?.value);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAppRoute = APP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);

  if ((isAppRoute || isAdminRoute) && !hasSession(req)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/discover/:path*",
    "/likes/:path*",
    "/matches/:path*",
    "/chats/:path*",
    "/live/:path*",
    "/visitors/:path*",
    "/premium/:path*",
    "/settings/:path*",
    "/verify/:path*",
    "/blocked/:path*",
    "/reports/:path*",
    "/admin/:path*"
  ]
};

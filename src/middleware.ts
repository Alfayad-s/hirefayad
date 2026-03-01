import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  // Paths are like /en/login, /hi/signup, /en/admin
  const pathAfterLocale = path.replace(/^\/[a-z]{2}(\/|$)/, "$1") || "/";
  const locale = path.split("/")[1] ?? routing.defaultLocale;

  if (isLoggedIn && (pathAfterLocale === "login" || pathAfterLocale === "signup")) {
    return Response.redirect(new URL(`/${locale}`, req.nextUrl.origin));
  }
  if (!isLoggedIn && pathAfterLocale.startsWith("admin")) {
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return Response.redirect(loginUrl);
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

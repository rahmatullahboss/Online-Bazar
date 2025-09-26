// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

// Protect everything except public assets, API, and the admin login page
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|admin/login).*)"],
};
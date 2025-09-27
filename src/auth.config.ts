import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [
    Google, // reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
  ],
  // Optional: force refresh tokens (will show Google consent every time)
  // providers: [Google({ authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } } })],
};
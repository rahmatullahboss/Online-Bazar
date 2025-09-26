import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // Map Google profile data to Payload user fields
          firstName: profile.given_name,
          lastName: profile.family_name,
        };
      }
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // Ensure firstName and lastName are in the session user object
        session.user.firstName = user?.firstName || (session.user.name ? session.user.name.split(' ')[0] : '');
        session.user.lastName = user?.lastName || (session.user.name ? session.user.name.split(' ').slice(1).join(' ') : '');
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle linking of existing accounts
      // This will allow users who previously signed up with email/password
      // to sign in with Google using the same email
      return true;
    },
  },
  // Optional: force refresh tokens (will show Google consent every time)
  // providers: [Google({ authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } } })],
};
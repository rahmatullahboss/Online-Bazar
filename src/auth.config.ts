import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Extend the default session user type to include firstName and lastName
interface CustomSessionUser extends Record<string, any> {
  firstName?: string;
  lastName?: string;
}

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
      // Cast session.user to our custom type
      const customUser = session.user as CustomSessionUser;
      
      if (customUser) {
        // Ensure firstName and lastName are in the session user object
        customUser.firstName = (user as any)?.firstName || (customUser.name ? customUser.name.split(' ')[0] : '');
        customUser.lastName = (user as any)?.lastName || (customUser.name ? customUser.name.split(' ').slice(1).join(' ') : '');
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
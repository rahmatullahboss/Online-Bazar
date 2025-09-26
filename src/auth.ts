// Separate client-side and server-side exports to avoid importing nodemailer in the browser
export { signIn, signOut } from "next-auth/react";

// Export the handlers for the API route
import NextAuth from "next-auth";
import { withPayload } from "payload-authjs";
import payloadConfig from "@payload-config"; // how Payload v3 exposes its config
import { authConfig } from "./auth.config";

const nextAuth = NextAuth(
  withPayload(authConfig, { payloadConfig })
);

export const { handlers } = nextAuth;
export const { GET, POST } = handlers;
// next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth"

// Extend the built-in session types
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;
    } & DefaultSession["user"]; // Keep the original properties
  }
}
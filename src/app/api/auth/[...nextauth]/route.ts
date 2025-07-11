import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

/**
 * Configuration options for NextAuth.js. This is the single source of truth for
 * all authentication logic, using the `next-auth` v4 paradigm.
 */
export const authOptions: NextAuthOptions = {
  // We are not using a database adapter here to maintain full control over the
  // user authentication flow and ensure the correct Supabase user ID is always used.
  
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      
      /**
       * The authorize callback is the heart of our credentials-based authentication.
       * It validates user credentials against our Supabase database.
       */
      async authorize(credentials) {
        console.log("\n--- [Server] `authorize` function triggered ---");

        if (!credentials?.email || !credentials?.password) {
          console.error("[Server] Authorize failed: Credentials not provided.");
          return null;
        }
        console.log(`[Server] Received credentials for email: ${credentials.email}`);

        // Create a temporary Supabase client to perform the sign-in check.
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log("[Server] Attempting to sign in with Supabase Auth...");
        // Step 1: Use Supabase's built-in function to verify the user's password.
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (authError || !authData.user) {
          console.error("[Server] Supabase auth failed:", authError?.message || "No user returned from Supabase.");
          return null; // This tells next-auth the login is invalid.
        }
        console.log(`[Server] Supabase auth successful. User ID: ${authData.user.id}`);

        // Step 2: Fetch the user's profile from our public `profiles` table.
        console.log(`[Server] Fetching profile for user: ${authData.user.id}`);
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        
        if (profileError || !profile) {
            console.error("[Server] Profile fetch failed:", profileError?.message || "Profile not found in 'profiles' table.");
            return null; // A valid user MUST have a profile.
        }
        
        console.log("[Server] Profile found:", profile);
        console.log("[Server] Returning user object to next-auth to create session.");
        
        // Step 3: Return the final user object for next-auth to use.
        // This object's shape is what gets passed to the JWT callback.
        return {
            id: profile.id, // The REAL Supabase user ID
            name: profile.name,
            email: profile.email,
        };
      }
    })
  ],
  
  session: {
    // We must use JWT as the session strategy to handle custom callbacks.
    strategy: 'jwt',
  },

  callbacks: {
    /**
     * The `jwt` callback is executed when a token is created.
     * We persist the real Supabase user ID to the token here.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    /**
     * The `session` callback is executed when a session is accessed.
     * We transfer the user ID from the token to the session object, making it
     * available to both client and server components via `getSession` or `useSession`.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/sign-in',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

// Create the main NextAuth handler with our options.
const handler = NextAuth(authOptions);

// Export the handler for both GET and POST requests, as required by Next.js.
export { handler as GET, handler as POST };
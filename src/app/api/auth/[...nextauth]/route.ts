import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

import { SignInSchema } from '@/lib/schemas';

// The mock 'users' array is now permanently removed. We use the database as the source of truth.

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      
      /**
       * The new authorize function. It no longer uses a mock array.
       * It attempts to sign in the user using Supabase's own auth functions.
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Create a Supabase client for this authorization check.
        // NOTE: In a real production app, you might want to use the service_role key
        // for more complex checks, but for signInWithPassword, the anon key is sufficient
        // if your RLS policies are set up correctly. For simplicity, we use the public keys.
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // First, try to sign in the user with their email and password using Supabase Auth.
        // This validates their credentials against the `auth.users` table.
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        // If Supabase returns an error or no user, the credentials are bad.
        if (authError || !authData.user) {
          console.error("Supabase auth error:", authError?.message);
          return null;
        }
        
        // If authentication is successful, fetch the user's profile from our public `profiles` table.
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        
        // If a profile exists, return a user object that next-auth can use.
        if (profile) {
            return {
                id: profile.id,
                name: profile.name,
                email: profile.email,
            };
        }
        
        // If no profile is found for a valid user, something is wrong. Reject the session.
        return null;
      }
    })
  ],
  // The rest of your configuration remains the same.
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
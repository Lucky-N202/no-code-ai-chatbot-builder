import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SignInSchema } from '@/lib/schemas';

// --- MOCK DATABASE ---
// In a real application, you would fetch this from a database like Supabase or Firebase.
const users = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', password: 'password123' },
];
// --------------------

/**
 * Configuration options for NextAuth.js.
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  /**
   * Configure one or more authentication providers.
   * We are using the Credentials provider for email/password sign-in.
   * @see https://next-auth.js.org/providers/credentials
   */
  providers: [
    CredentialsProvider({
      // The name to display on the sign-in form (e.g., 'Sign in with...')
      name: 'Credentials',
      
      // `credentials` is used to generate a form on the default sign-in page.
      // We don't use the default page, but it's good practice to define the shape.
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },

      /**
       * The authorize callback is where you retrieve a user from your database
       * and verify their credentials.
       * @param credentials The credentials submitted by the user.
       * @returns A user object or null if authentication fails.
       */
      async authorize(credentials) {
        // If credentials are not provided, authentication cannot proceed.
        if (!credentials) {
          return null;
        }

        // Validate the incoming credentials against our Zod schema.
        const validatedFields = SignInSchema.safeParse(credentials);
        
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          
          // Find the user in our mock database.
          const user = users.find((u) => u.email === email);

          // IMPORTANT: In a production app, NEVER compare plain text passwords.
          // You should hash passwords during sign-up and use a library like `bcrypt`
          // to compare the submitted password with the stored hash.
          // e.g., const passwordsMatch = await bcrypt.compare(password, user.password);
          if (user && user.password === password) {
            
            // If the user is found and the password is correct, return the user object
            // without the password hash.
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }
        }
        
        // If authentication fails for any reason, return null.
        // NextAuth will then reject the sign-in attempt.
        return null;
      }
    })
  ],

  /**
   * Callbacks are asynchronous functions you can use to control what happens
   * when an action is performed.
   * @see https://next-auth.js.org/configuration/callbacks
   */
  callbacks: {
    /**
     * The `jwt` callback is called whenever a JSON Web Token is created or updated.
     * We use this to persist the user's ID from the `user` object to the `token`.
     * @param token The token object.
     * @param user The user object from the `authorize` callback (only available on initial sign-in).
     * @returns The updated token.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    /**
     * The `session` callback is called whenever a session is checked.
     * We use this to pass our custom data from the token to the session object,
     * making it available on the client-side.
     * @param session The session object.
     * @param token The token from the `jwt` callback.
     * @returns The updated session object.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  /**
   * Specifies the session strategy. 'jwt' is the default and recommended strategy.
   */
  session: {
    strategy: 'jwt',
  },

  /**
   * Defines custom pages for authentication actions.
   */
  pages: {
    signIn: '/sign-in',
    // You can also define pages for sign-out, error, etc.
    // error: '/auth/error', 
  },

  /**
   * A secret used to sign and encrypt JWTs, sign cookies, and generate cryptographic keys.
   * This is sourced from your `.env.local` file.
   */
  secret: process.env.NEXTAUTH_SECRET,
};

// Initialize NextAuth.js with the defined options.
const handler = NextAuth(authOptions);

// Export the handler for Next.js to use for GET and POST requests to this route.
export { handler as GET, handler as POST };
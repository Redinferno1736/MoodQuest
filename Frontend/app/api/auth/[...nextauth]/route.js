import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCredentials } from '@/lib/auth';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        // verifyCredentials must return { id, name, email } or null
        const user = await verifyCredentials(credentials.email, credentials.password);
        return user;
      },
    }),
  ],

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  callbacks: {
    // Persist id + name into the JWT token on first sign-in
    async jwt({ token, user, account, profile }) {
      if (user) {
        // Credentials login → user.id set by verifyCredentials
        token.id = user.id;
        token.name = user.name;
      }
      if (account?.provider === 'google' && profile) {
        // For OAuth, use the sub (Google UID) as the stable user_id
        token.id = profile.sub;
        token.name = profile.name;
      }
      if (account?.provider === 'facebook' && profile) {
        token.id = profile.id;
        token.name = profile.name;
      }
      return token;
    },

    // Expose id on the client-side session object
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;       // ← this is what dashboard reads
        session.user.name = token.name;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
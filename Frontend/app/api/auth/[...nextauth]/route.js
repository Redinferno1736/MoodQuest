import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCredentials } from '@/lib/auth';

const handler = NextAuth({
  debug: true, // helpful during debugging

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

        const user = await verifyCredentials(
          credentials.email,
          credentials.password
        );

        return user; // must return { id, name, email } or null
      },
    }),
  ],

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  callbacks: {
    // ✅ SAFE JWT HANDLING
    async jwt({ token, user, account, profile }) {
      // Credentials login
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }

      // Google OAuth
      if (account?.provider === 'google') {
        if (profile?.sub) {
          token.id = profile.sub;
        }
        if (profile?.name) {
          token.name = profile.name;
        }
      }

      // Facebook OAuth
      if (account?.provider === 'facebook') {
        if (profile?.id) {
          token.id = profile.id;
        }
        if (profile?.name) {
          token.name = profile.name;
        }
      }

      return token;
    },

    // ✅ SAFE SESSION HANDLING
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id || null,
        name: token.name || session.user?.name,
      };
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
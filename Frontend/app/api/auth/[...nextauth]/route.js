import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCredentials } from '@/lib/auth';
import { getDb } from '@/lib/db';

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
    async jwt({ token, user, account, profile }) {
      if (account && profile) {
        if (account.provider === 'google') {
          // profile.sub is permanent — use it directly, no DB lookup needed
          token.id = profile.sub;
          token.name = profile.name;

          // Still upsert to DB for storing user info, but don't depend on it for the ID
          try {
            const db = await getDb();
            await db.collection('users').updateOne(
              { googleId: profile.sub },
              {
                $set: { name: profile.name, email: profile.email, updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date() }
              },
              { upsert: true }
            );
          } catch (err) {
            console.error('Google upsert error:', err);
            // token.id is already set above — auth still works fine
          }
        }
        if (account.provider === 'facebook') {
          token.id = profile.id;
          token.name = profile.name;
        }
      }
      if (user && !account?.provider?.match(/google|facebook/)) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          name: token.name,
        };
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
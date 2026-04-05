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
      // ── First sign-in: account + profile are present ──────────────────────
      if (account && profile) {
        if (account.provider === 'google') {
          // Upsert Google user into MongoDB so their history is always linked
          // to a stable document, not just the ephemeral profile.sub string.
          try {
            const db = await getDb();
            const existing = await db.collection('users').findOne({ googleId: profile.sub });

            if (existing) {
              // User already exists — use their MongoDB _id as the stable id
              token.id = existing._id.toString();
            } else {
              // First-ever Google login — create a document so we have a home
              // for any future profile data / preferences stored server-side.
              const result = await db.collection('users').insertOne({
                googleId: profile.sub,
                name: profile.name,
                email: profile.email,
                createdAt: new Date(),
              });
              token.id = result.insertedId.toString();
            }
          } catch (err) {
            // Fallback: use profile.sub so auth still works even if DB is down
            console.error('Google upsert error:', err);
            token.id = profile.sub;
          }

          token.name = profile.name;
        }

        if (account.provider === 'facebook') {
          token.id = profile.id;
          token.name = profile.name;
        }
      }

      // ── Credentials sign-in: user object is returned by authorize() ───────
      if (user && !account?.provider?.match(/google|facebook/)) {
        token.id = user.id;
        token.name = user.name;
      }

      // ── Subsequent calls: token.id is already set — just pass it through ──
      // (account is null on subsequent calls, so none of the above if-blocks
      //  fire, and token.id from the previous JWT is preserved automatically)
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
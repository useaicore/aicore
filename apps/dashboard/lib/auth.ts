import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import pg from 'pg';
const { Pool: PgPool } = pg;
import { env } from './env';
import { sendEmail } from './email';

// GitHub OAuth App setup:
// 1. github.com → Settings → Developer settings → OAuth Apps
// 2. New OAuth App
// 3. Homepage URL: http://localhost:3000
// 4. Callback URL: http://localhost:3000/api/auth/callback/github
// 5. Copy Client ID and Client Secret to .env.local

export const auth = betterAuth({
  database: new PgPool({
    connectionString: env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: 'Sign in to AICore',
          html: `
            <p>Click the link below to sign in to AICore.</p>
            <p>This link expires in 15 minutes.</p>
            <a href="${url}">${url}</a>
            <p>If you didn't request this, ignore this email.</p>
          `,
        });
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if > 1 day old
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
});

export type Session = typeof auth.$Infer.Session;

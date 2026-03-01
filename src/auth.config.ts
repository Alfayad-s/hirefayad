import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Node.js deps: no DB, no bcrypt).
 * Used by middleware. Full config with Credentials lives in auth.ts.
 */
export default {
  providers: [], // Required by NextAuth; real providers are in auth.ts
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;

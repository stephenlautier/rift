import NextAuth from "next-auth";

import { authConfig } from "@rift/next-shared";

/**
 * Shell owns the NextAuth handlers (`GET|POST /api/auth/[...nextauth]`).
 * Other zones only import `auth` (read-only session check).
 */
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

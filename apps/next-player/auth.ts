import NextAuth from "next-auth";

import { authConfig } from "@rift/next-shared";

/**
 * Player zone reads sessions and guards routes via proxy.ts.
 * Sign-out is handled by the shell zone (/api/auth/**).
 */
export const { auth, signOut } = NextAuth(authConfig);

import { authConfig } from "@rift/next-shared";
import NextAuth from "next-auth";
import type { NextAuthResult } from "next-auth";

/**
 * Player zone reads sessions and guards routes via proxy.ts.
 * Sign-out is handled by the shell zone (/api/auth/**).
 */
const nextAuth: NextAuthResult = NextAuth(authConfig);
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;

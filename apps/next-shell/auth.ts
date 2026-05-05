import { authConfig } from "@rift/next-shared";
import NextAuth from "next-auth";
import type { NextAuthResult, Session } from "next-auth";

/**
 * Shell owns the NextAuth handlers (`GET|POST /api/auth/[...nextauth]`).
 * Other zones only import `auth` (read-only session check).
 */
const nextAuth: NextAuthResult = NextAuth(authConfig);
export const handlers: NextAuthResult["handlers"] = nextAuth.handlers;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signIn: (provider: string, options?: Record<string, unknown>) => Promise<Session | null> =
	nextAuth.signIn as (provider: string, options?: Record<string, unknown>) => Promise<Session | null>;

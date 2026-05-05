import { authConfig } from "@rift/next-shared";
import NextAuth from "next-auth";
import type { NextAuthResult } from "next-auth";

/**
 * Champions zone only reads the session — no handlers (no `/api/auth/**`).
 * Shares AUTH_SECRET with shell to verify the JWT cookie.
 */
const nextAuth: NextAuthResult = NextAuth(authConfig);
export const auth: NextAuthResult["auth"] = nextAuth.auth;

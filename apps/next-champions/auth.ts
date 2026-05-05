import NextAuth from "next-auth";

import { authConfig } from "@rift/next-shared";

/**
 * Champions zone only reads the session — no handlers (no `/api/auth/**`).
 * Shares AUTH_SECRET with shell to verify the JWT cookie.
 */
export const { auth } = NextAuth(authConfig);

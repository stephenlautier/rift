import { createAuthProxy } from "@rift/next-shared";

import { auth } from "@/auth";
import { AUTH_URL } from "@/env";

const loginUrl = `${AUTH_URL}/login`;

/**
 * Next.js 16 `proxy.ts` — replaces the deprecated `middleware.ts`.
 * Guards all /player/** routes: unauthenticated requests are redirected to the
 * shell's login page with the original URL as `callbackUrl`.
 */
export const proxy = createAuthProxy(auth, loginUrl);

export const config = {
	matcher: ["/player/:path*"],
};

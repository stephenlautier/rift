import { auth } from "@/auth";
import { createAuthProxy } from "@rift/next-shared";

const loginUrl = (process.env.AUTH_URL ?? "http://localhost:3000") + "/login";

/**
 * Next.js 16 `proxy.ts` — replaces the deprecated `middleware.ts`.
 * Guards all /player/** routes: unauthenticated requests are redirected to the
 * shell's login page with the original URL as `callbackUrl`.
 */
export const proxy = createAuthProxy(auth, loginUrl);

export const config = {
	matcher: ["/player/:path*"],
};

import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthFn = () => Promise<Session | null>;

/**
 * Factory that creates a Next.js 16 `proxy` function guarding protected routes.
 *
 * In Next.js 16 `proxy.ts` replaces the deprecated `middleware.ts`. The
 * exported function is named `proxy` (not `default`).
 *
 * @param authFn  - The `auth()` function from the zone's `./auth` module.
 * @param loginUrl - Absolute URL of the sign-in page (defaults to AUTH_URL/login).
 *
 * Usage in `apps/next-player/proxy.ts`:
 * ```ts
 * import { auth } from './auth'
 * import { createAuthProxy } from '@rift/next-shared'
 * export const proxy = createAuthProxy(auth, process.env.AUTH_URL + '/login')
 * export const config = { matcher: ['/player/:path*'] }
 * ```
 */
export function createAuthProxy(authFn: AuthFn, loginUrl: string) {
	return async function proxy(request: NextRequest): Promise<NextResponse | undefined> {
		const session = await authFn();
		if (!session) {
			const target = new URL(loginUrl);
			target.searchParams.set("callbackUrl", request.url);
			return NextResponse.redirect(target);
		}
		return undefined;
	};
}

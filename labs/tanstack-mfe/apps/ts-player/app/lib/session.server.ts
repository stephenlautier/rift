import type { Session } from "@auth/core/types";
import { getSession } from "@rift/auth";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Plain server-side helper that reads the Auth.js session for the current
 * request. Called inside a `createServerFn` handler in `__root.tsx` so it
 * always runs on the server — the `getRequest()` context is live.
 *
 * Do NOT wrap this in a second `createServerFn` — nesting server fns causes
 * the inner `getRequest()` to lose the original HTTP context.
 */
export async function getServerSession(): Promise<Session | null> {
	const request = getRequest();
	return getSession(request);
}

import { getSession } from "@auth/core";
import type { Session } from "@auth/core/types";
import { authjsConfig } from "@rift/auth";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Server function that reads the Auth.js session from the incoming request
 * cookie. Safe to call in TanStack Router `beforeLoad` at the root route —
 * runs on the server for SSR and as an RPC call on client-side navigation.
 *
 * The result is cached in the root route's loader context so the session is
 * available to all descendant routes via `context.session`.
 */
export const getServerSession = createServerFn().handler(async (): Promise<Session | null> => {
	const request = getRequest();
	return getSession(request, authjsConfig);
});

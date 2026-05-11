import { Auth } from "@auth/core";
import { authjsConfig } from "@rift/auth";
import { createFileRoute } from "@tanstack/react-router";

/**
 * Wildcard server route that handles all Auth.js requests at /api/auth/*.
 *
 * Auth.js uses `authjsConfig.basePath` ("/api/auth") to strip the prefix
 * before matching internal handlers (e.g. /csrf, /signin, /callback/*, /signout).
 *
 * Uses `createFileRoute` with `server.handlers` — the current TanStack Start API
 * for server-only routes that are registered in the route tree.
 */
export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => Auth(request, authjsConfig),
			POST: async ({ request }: { request: Request }) => Auth(request, authjsConfig),
		},
	},
});

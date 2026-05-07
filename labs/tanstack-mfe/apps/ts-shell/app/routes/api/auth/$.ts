import { Auth } from "@auth/core";
import { authjsConfig } from "@rift/auth";
import { createFileRoute } from "@tanstack/react-router";

/**
 * Wildcard server route that handles all Auth.js requests at /api/auth/*.
 *
 * Auth.js uses `authjsConfig.basePath` ("/api/auth") to strip the prefix
 * before matching internal handlers (e.g. /csrf, /signin, /callback/*, /signout).
 *
 * This route takes precedence over the Nitro proxy routeRules in vite.config.ts
 * because TanStack Start's router handles requests before Nitro routeRules apply.
 */
export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: async ({ request }) => Auth(request, authjsConfig),
			POST: async ({ request }) => Auth(request, authjsConfig),
		},
	},
});

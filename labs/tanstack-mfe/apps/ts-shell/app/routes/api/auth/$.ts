import { Auth } from "@auth/core";
import { authjsConfig } from "@rift/auth";
import { createAPIFileRoute } from "@tanstack/react-start/api";

/**
 * Wildcard API route that handles all Auth.js requests at /api/auth/*.
 *
 * Auth.js uses `authjsConfig.basePath` ("/api/auth") to strip the prefix
 * before matching internal handlers (e.g. /csrf, /signin, /callback/*, /signout).
 *
 * Uses `createAPIFileRoute` (not `createFileRoute`) so TanStack Start registers
 * it as a pure API handler — no React tree, no loader, no HTML shell.
 * This route takes precedence over Nitro `routeRules` because TanStack Start
 * processes server routes before Nitro proxy rules apply.
 */
export const APIRoute = createAPIFileRoute("/api/auth/$")({
	GET: async ({ request }: { request: Request }) => Auth(request, authjsConfig),
	POST: async ({ request }: { request: Request }) => Auth(request, authjsConfig),
});

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";

/**
 * When this zone's HTML is served through the shell proxy (e.g. localhost:3000/champions),
 * Vite-internal paths such as `/@react-refresh` and `/@id/virtual:tanstack-start-client-entry`
 * resolve to the shell's port (3000) instead of this zone's port, loading the wrong JS and
 * causing a TanStack Router hydration invariant error.
 *
 * Fix — Import Map via `configureServer` response interception:
 *   TanStack Start generates the entire HTML from SSR (no static index.html template), so
 *   Vite's `transformIndexHtml` tag-injection mechanism does not work in this context.
 *   Instead we intercept the HTTP response in `configureServer`, detect HTML responses, and
 *   inject a `<script type="importmap">` that redirects Vite-internal specifiers to absolute
 *   URLs pointing at this zone's port, so the correct JavaScript is loaded regardless of
 *   the serving origin.
 *
 *   The map is safe to apply unconditionally: when accessed directly at the zone's own port
 *   the specifiers resolve to the same origin as the mapped values, so no behaviour changes.
 */
function absoluteVitePaths(origin: string): Plugin {
	const importMapTag = `<script type="importmap">${JSON.stringify({
		imports: {
			"/@react-refresh": `${origin}/@react-refresh`,
			"/@id/virtual:tanstack-start-client-entry": `${origin}/@id/virtual:tanstack-start-client-entry`,
			"/@vite/client": `${origin}/@vite/client`,
		},
	})}</script>`;

	return {
		name: "rift:absolute-vite-paths",
		apply: "serve",
		configureServer(server) {
			// Return a function to add the middleware AFTER Vite's built-ins so we intercept
			// the final HTML response from TanStack Start's Nitro SSR handler.
			return () => {
				server.middlewares.use((_req, res, next) => {
					// oxlint-disable-next-line typescript/unbound-method -- required for prototype swap
					const originalEnd = res.end.bind(res);
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(res as any).end = function end(chunk?: any, encoding?: any, callback?: any) {
						const ct = res.getHeader("content-type");
						if (typeof ct === "string" && ct.includes("text/html") && chunk !== null && chunk !== undefined) {
							const html = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
							if (html.includes("<!DOCTYPE html>") || html.includes("<html")) {
								// Inject the import map at the start of <body> so it appears
								// before any <script type="module"> but after <head> links.
								const patched = html.includes("<body>")
									? html.replace("<body>", `<body>${importMapTag}`)
									: html.replace(
											"<html",
											`<script type="importmap">${importMapTag.slice(importMapTag.indexOf(">") + 1, -9)}</script><html`,
										);
								res.removeHeader("content-length");
								return originalEnd(patched, encoding, callback);
							}
						}
						return originalEnd(chunk, encoding, callback);
					};
					next();
				});
			};
		},
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const port = Number.parseInt(env.PORT ?? "3001", 10);

	return {
		// @rift/ui ships un-transpiled Stencil components — bundle them in SSR
		ssr: {
			noExternal: ["@rift/ui"],
			external: ["@rift/ui/hydrate"],
		},
		plugins: [
			absoluteVitePaths(`http://localhost:${port}`),
			tailwindcss(),
			tanstackStart({
				srcDirectory: "app",
				tsr: {
					routesDirectory: "app/routes",
					generatedRouteTree: "app/routeTree.gen.ts",
					quoteStyle: "double",
				},
				// Zone-specific server function base path.
				// The shell proxy rule `/champions/**` → 3001 covers this path,
				// routing RPC calls to the right zone server.
				serverFns: { base: "/champions/_serverFn" },
			}),
			viteReact(),
			// In dev, `createClientRpc.js` is served via `@fs/` (not pre-bundled) so
			// Vite's `define` substitution never runs on it. Patch it directly so the
			// RPC fetches land on the correct zone server instead of the shell.
			{
				name: "rift:patch-server-fn-base",
				apply: "serve",
				transform(code: string, id: string) {
					if (!id.includes("createClientRpc")) {
						return;
					}
					return {
						code: code.replaceAll(/process\.env\.TSS_SERVER_FN_BASE/g, JSON.stringify("/champions/_serverFn/")),
					};
				},
			},
		],
		server: { port, origin: `http://localhost:${port}` },
		preview: { port },
		// Expose zone origin as a compile-time constant so __root.tsx can inject
		// a dev-mode import map that redirects Vite-internal paths to this zone's
		// port, preventing cross-zone hydration errors when served via shell proxy.
		define: {
			__ZONE_ORIGIN__: JSON.stringify(`http://localhost:${port}`),
		},
	};
});

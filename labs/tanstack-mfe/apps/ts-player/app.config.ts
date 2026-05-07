import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/start/config";

export default defineConfig({
	tsr: {
		appDirectory: "app",
		routesDirectory: "app/routes",
		generatedRouteTree: "app/routeTree.gen.ts",
		quoteStyle: "double",
	},
	vite: {
		plugins: [tailwindcss()],
		base: process.env.NODE_ENV === "production" ? "/player-static/" : "/",
		/**
		 * @rift/ui uses Stencil's `dist-hydrate-script` output for SSR.
		 * The hydrate module must run in Node.js (not bundled by Vite) so we
		 * mark it as external. This mirrors the Next.js zone's
		 * `serverExternalPackages: ['@rift/ui/hydrate']` config.
		 */
		ssr: {
			noExternal: ["@rift/ui"],
			external: ["@rift/ui/hydrate"],
		},
	},
});

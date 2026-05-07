import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	// @rift/ui ships un-transpiled Stencil components — bundle them in SSR
	ssr: {
		noExternal: ["@rift/ui"],
		external: ["@rift/ui/hydrate"],
	},
	plugins: [
		tailwindcss(),
		tanstackStart({
			srcDirectory: "app",
			tsr: {
				routesDirectory: "app/routes",
				generatedRouteTree: "app/routeTree.gen.ts",
				quoteStyle: "double",
			},
		}),
		viteReact(),
	],
});

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
		/**
		 * In production, Vite builds assets with a /champions-static/ base so
		 * they don't collide with other zones' assets when served through the shell.
		 * The shell's Nitro proxy rule '/champions-static/**' handles serving them.
		 *
		 * In dev, base is '/' — each zone runs on its own port with no conflicts.
		 */
		base: process.env.NODE_ENV === "production" ? "/champions-static/" : "/",
	},
});

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
		base: process.env.NODE_ENV === "production" ? "/tier-list-static/" : "/",
	},
});

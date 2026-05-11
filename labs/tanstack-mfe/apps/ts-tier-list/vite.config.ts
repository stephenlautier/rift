import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const port = Number.parseInt(env.PORT ?? "3002", 10);

	return {
		resolve: {
			alias: {
				// matches tsconfig.json paths: "@/*" → "./app/*"
				"@": path.resolve(__dirname, "app"),
			},
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
		server: { port },
		preview: { port },
	};
});

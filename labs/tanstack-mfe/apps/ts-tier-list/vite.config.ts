import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const port = Number.parseInt(env.PORT ?? "3002");

	return {
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

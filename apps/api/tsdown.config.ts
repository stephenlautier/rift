import { defineConfig } from "tsdown";

export default defineConfig([
	// Library entry: exports the Hono app + ApiType for typed RPC clients
	{
		entry: { app: "src/app.ts" },
		format: ["esm"],
		dts: true,
		outDir: "dist",
		clean: true,
		platform: "node",
	},
	// Server entry: starts the @hono/node-server listener
	{
		entry: { index: "src/index.ts" },
		format: ["esm"],
		dts: false,
		outDir: "dist",
		clean: false,
		sourcemap: true,
		platform: "node",
	},
]);

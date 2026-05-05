import type { NextConfig } from "next";

const config: NextConfig = {
	// Route all static assets under a distinct prefix so shell rewrites don't collide.
	assetPrefix: process.env.NODE_ENV === "production" ? "/champions-static" : undefined,
	// All routes served by this zone live under /champions.
	basePath: "/champions",
	serverActions: {
		allowedOrigins: [process.env.SHELL_ORIGIN ?? "http://localhost:3000"],
	},
	transpilePackages: ["@rift/next-shared", "@rift/ui"],
	serverExternalPackages: ["@rift/ui/hydrate"],
	output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
};

export default config;

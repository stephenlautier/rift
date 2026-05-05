import type { NextConfig } from "next";

const config = {
	// Route all static assets under a distinct prefix so shell rewrites don't collide.
	assetPrefix: process.env.NODE_ENV === "production" ? "/champions-static" : "",
	// All routes served by this zone live under /champions.
	basePath: "/champions",
	transpilePackages: ["@rift/next-shared", "@rift/ui"],
	serverExternalPackages: ["@rift/ui/hydrate"],
	...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
} satisfies NextConfig;

export default config;

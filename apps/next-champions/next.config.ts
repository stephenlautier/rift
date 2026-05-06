import type { NextConfig } from "next";

// In dev, point assets directly at the zone origin so the browser can fetch
// them from the zone server rather than through the shell proxy.
// In production, use a path prefix that the shell rewrites to the zone.
const assetPrefix =
	process.env.NODE_ENV === "production"
		? "/champions-static"
		: (process.env.NEXT_PUBLIC_CHAMPIONS_URL ?? "http://localhost:3001");

const config = {
	assetPrefix,
	transpilePackages: ["@rift/next-shared", "@rift/ui"],
	serverExternalPackages: ["@rift/ui/hydrate"],
	...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
} satisfies NextConfig;

export default config;

import type { NextConfig } from "next";

const assetPrefix =
	process.env.NODE_ENV === "production"
		? "/player-static"
		: (process.env.NEXT_PUBLIC_PLAYER_URL ?? "http://localhost:3003");

const config = {
	assetPrefix,
	transpilePackages: ["@rift/next-shared"],
	...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
} satisfies NextConfig;

export default config;

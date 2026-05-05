import type { NextConfig } from "next";

const config = {
	assetPrefix: process.env.NODE_ENV === "production" ? "/player-static" : "",
	basePath: "/player",
	transpilePackages: ["@rift/next-shared"],
	...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
} satisfies NextConfig;

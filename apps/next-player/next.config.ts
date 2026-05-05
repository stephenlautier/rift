import type { NextConfig } from "next";

const config: NextConfig = {
	assetPrefix: process.env.NODE_ENV === "production" ? "/player-static" : undefined,
	basePath: "/player",
	serverActions: {
		allowedOrigins: [process.env.SHELL_ORIGIN ?? "http://localhost:3000"],
	},
	transpilePackages: ["@rift/next-shared"],
	output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
};

export default config;

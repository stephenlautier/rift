import type { NextConfig } from "next";

const NEXT_CHAMPIONS_URL = process.env.NEXT_CHAMPIONS_URL ?? "http://localhost:3001";
const NEXT_TIER_LIST_URL = process.env.NEXT_TIER_LIST_URL ?? "http://localhost:3002";
const NEXT_PLAYER_URL = process.env.NEXT_PLAYER_URL ?? "http://localhost:3003";
const API_URL = process.env.API_URL ?? "http://localhost:3100";

const config: NextConfig = {
	transpilePackages: ["@rift/next-shared", "@rift/ui"],
	serverExternalPackages: ["@rift/ui/hydrate"],
	async rewrites() {
		return [
			// Champions zone
			{
				source: "/champions/:path*",
				destination: `${NEXT_CHAMPIONS_URL}/champions/:path*`,
			},
			{
				source: "/champions-static/:path*",
				destination: `${NEXT_CHAMPIONS_URL}/champions-static/:path*`,
			},
			// Tier-list zone
			{
				source: "/tier-list/:path*",
				destination: `${NEXT_TIER_LIST_URL}/tier-list/:path*`,
			},
			{
				source: "/tier-list-static/:path*",
				destination: `${NEXT_TIER_LIST_URL}/tier-list-static/:path*`,
			},
			// Player zone
			{
				source: "/player/:path*",
				destination: `${NEXT_PLAYER_URL}/player/:path*`,
			},
			{
				source: "/player-static/:path*",
				destination: `${NEXT_PLAYER_URL}/player-static/:path*`,
			},
			// API proxy
			{
				source: "/api/:path*",
				destination: `${API_URL}/api/:path*`,
			},
		];
	},
	// Standalone output for Docker deployment
	...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
};

export default config;

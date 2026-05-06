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
			// ── Zone rewrites ───────────────────────────────────────────────────────
			// Each zone uses a path-based assetPrefix (e.g. "/tier-list-static").
			// In Next.js 15+, the zone natively serves /{prefix}/_next/... so the
			// single /:path* catch-all below handles both page routes AND static
			// assets (including webpack-hmr WebSocket upgrades). A separate
			// /{prefix}/_next/:path* rewrite is NOT needed and was incorrectly
			// stripping the prefix, causing 404s for the HMR endpoint.
			// ── Zone page rewrites ───────────────────────────────────────────────────
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
			// Hono API proxy — explicit paths only, never matching /api/auth/** which
			// is owned by NextAuth route handlers in this zone.
			// Strip the /api prefix: browser calls /api/champions → Hono /champions.
			{
				source: "/api/champions",
				destination: `${API_URL}/champions`,
			},
			{
				source: "/api/champions/:path*",
				destination: `${API_URL}/champions/:path*`,
			},
			{
				source: "/api/tier-list",
				destination: `${API_URL}/tier-list`,
			},
			{
				source: "/api/tier-list/:path*",
				destination: `${API_URL}/tier-list/:path*`,
			},
			{
				source: "/api/player",
				destination: `${API_URL}/player`,
			},
			{
				source: "/api/player/:path*",
				destination: `${API_URL}/player/:path*`,
			},
			{
				source: "/api/health",
				destination: `${API_URL}/health`,
			},
		];
	},
	// Standalone output for Docker deployment
	...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
};

export default config;

import type { NextConfig } from "next";

const SHELL_ORIGIN = process.env.SHELL_ORIGIN ?? "http://localhost:3000";

const config = {
	// Path-based assetPrefix. In Next.js 15+ the zone natively serves
	// /{prefix}/_next/... so the shell's single catch-all rewrite handles both
	// page routes and static assets (including WebSocket HMR upgrades).
	assetPrefix: "/champions-static",
	images: {
		remotePatterns: [
			{
				protocol: "https" as const,
				hostname: "ddragon.leagueoflegends.com",
				pathname: "/**",
			},
		],
	},
	// Allow the shell origin to access this dev server (HMR, hot-reload).
	allowedDevOrigins: [new URL(SHELL_ORIGIN).host],
	transpilePackages: ["@rift/next-shared", "@rift/ui"],
	serverExternalPackages: ["@rift/ui/hydrate"],
	...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
} satisfies NextConfig;

export default config;

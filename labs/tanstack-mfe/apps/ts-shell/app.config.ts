import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/start/config";

const TS_CHAMPIONS_URL = process.env.TS_CHAMPIONS_URL ?? "http://localhost:3001";
const TS_TIER_LIST_URL = process.env.TS_TIER_LIST_URL ?? "http://localhost:3002";
const TS_PLAYER_URL = process.env.TS_PLAYER_URL ?? "http://localhost:3003";
const API_URL = process.env.API_URL ?? "http://localhost:3100";

export default defineConfig({
	tsr: {
		appDirectory: "app",
		routesDirectory: "app/routes",
		generatedRouteTree: "app/routeTree.gen.ts",
		quoteStyle: "double",
	},
	vite: {
		plugins: [tailwindcss()],
	},
	server: {
		/**
		 * Nitro routeRules proxy — the shell has ZERO route files for MFE paths.
		 * Each zone owns its routes 100%.
		 *
		 * How ** substitution works:
		 *   source '/champions/**'  +  target '${URL}/champions/**'
		 *   request '/champions/ahri'  →  source captures 'ahri'
		 *   final URL: '${URL}/champions/ahri'  (prefix preserved)
		 *
		 *   source '/api/champions/**'  +  target '${API_URL}/champions/**'
		 *   request '/api/champions/ahri'  →  source captures 'ahri'
		 *   final URL: '${API_URL}/champions/ahri'  (/api/ prefix stripped ✓)
		 *
		 * /api/auth/** is NOT listed here — TanStack Start's own server route
		 * at app/routes/api/auth/$.ts handles it before Nitro routeRules apply.
		 */
		routeRules: {
			// ── Zone proxies ───────────────────────────────────────────────────
			"/champions/**": { proxy: `${TS_CHAMPIONS_URL}/champions/**` },
			"/champions-static/**": { proxy: `${TS_CHAMPIONS_URL}/champions-static/**` },
			"/tier-list/**": { proxy: `${TS_TIER_LIST_URL}/tier-list/**` },
			"/tier-list-static/**": { proxy: `${TS_TIER_LIST_URL}/tier-list-static/**` },
			"/player/**": { proxy: `${TS_PLAYER_URL}/player/**` },
			"/player-static/**": { proxy: `${TS_PLAYER_URL}/player-static/**` },
			// ── API proxy — strips /api prefix via ** substitution ──────────────
			"/api/health": { proxy: `${API_URL}/health` },
			"/api/champions": { proxy: `${API_URL}/champions` },
			"/api/champions/**": { proxy: `${API_URL}/champions/**` },
			"/api/tier-list": { proxy: `${API_URL}/tier-list` },
			"/api/tier-list/**": { proxy: `${API_URL}/tier-list/**` },
		},
	},
});

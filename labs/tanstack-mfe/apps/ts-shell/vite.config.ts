import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	const TS_CHAMPIONS_URL = env.TS_CHAMPIONS_URL ?? "http://localhost:3001";
	const TS_TIER_LIST_URL = env.TS_TIER_LIST_URL ?? "http://localhost:3002";
	const TS_PLAYER_URL = env.TS_PLAYER_URL ?? "http://localhost:3003";
	const API_URL = env.API_URL ?? "http://localhost:3100";
	const port = Number.parseInt(env.PORT ?? "3000");

	return {
		plugins: [
			/**
			 * Nitro proxy rules — the shell has ZERO route files for MFE paths.
			 * Each zone owns its routes 100%.
			 *
			 * ** substitution:
			 *   source '/champions/**' + target '${URL}/champions/**'
			 *   request '/champions/ahri' → '${URL}/champions/ahri' (prefix preserved)
			 *
			 * API strip example:
			 *   source '/api/champions/**' + target '${API_URL}/champions/**'
			 *   request '/api/champions/ahri' → '${API_URL}/champions/ahri' (/api/ stripped ✓)
			 *
			 * /api/auth/** is NOT listed here — the TanStack Start server route at
			 * app/routes/api/auth/$.ts handles it before Nitro routeRules apply.
			 */
			nitro({
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
			}),
			tailwindcss(),
			tanstackStart({
				srcDirectory: "app",
				tsr: {
					routesDirectory: "app/routes",
					generatedRouteTree: "app/routeTree.gen.ts",
					quoteStyle: "double",
				},
			}),
			viteReact(),
		],
		server: { port },
		preview: { port },
	};
});

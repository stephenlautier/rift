function requireEnv(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

/** Shell's public URL — NextAuth callback base and cross-zone sign-out target. */
export const AUTH_URL = requireEnv("AUTH_URL");

/** Zone URLs used by next.config.ts rewrites (also exported for use in server code). */
export const NEXT_CHAMPIONS_URL = process.env.NEXT_CHAMPIONS_URL ?? "http://localhost:3001";
export const NEXT_TIER_LIST_URL = process.env.NEXT_TIER_LIST_URL ?? "http://localhost:3002";
export const NEXT_PLAYER_URL = process.env.NEXT_PLAYER_URL ?? "http://localhost:3003";

/** Hono API base URL for server-side rewrites and data fetching. */
export const API_URL = requireEnv("API_URL");

function requireEnv(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

/** Shell's public URL — used by proxy.ts for unauthenticated redirect and sign-out. */
export const AUTH_URL = requireEnv("AUTH_URL");

/** Shell origin for serverActions.allowedOrigins and cross-zone sign-out. */
export const SHELL_ORIGIN = requireEnv("SHELL_ORIGIN");

/** Hono API base URL for server-side data fetching. */
export const API_URL = requireEnv("API_URL");

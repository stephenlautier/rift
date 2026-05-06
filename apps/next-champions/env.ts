function requireEnv(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

/** Shell origin for cross-zone sign-out redirects and serverActions.allowedOrigins. */
export const SHELL_ORIGIN = requireEnv("SHELL_ORIGIN");

/** Hono API base URL for server-side data fetching. */
export const API_URL = requireEnv("API_URL");

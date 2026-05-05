import type { Player, PlayerChampion, PlayerMatchEntry } from "@rift/player";

import { createApiClient } from "../api-client";

/**
 * Server-side player fetchers for use in Next.js Server Components.
 *
 * The `cookie` parameter must be the raw `cookie` header value from the
 * incoming request so the Hono API can verify the session.
 *
 * @example
 * ```ts
 * import { cookies } from 'next/headers'
 * const cookieStore = await cookies()
 * const player = await fetchPlayerMe(cookieStore.toString(), process.env.API_URL!)
 * ```
 */

export async function fetchPlayerMe(cookie: string, baseUrl = "/api"): Promise<Player> {
	const client = createApiClient(baseUrl);
	const res = await client.player.me.$get({}, { init: { headers: { cookie } } });
	if (!res.ok) {
		throw new Error(`fetchPlayerMe: HTTP ${res.status}`);
	}
	return res.json();
}

export async function fetchPlayerChampions(cookie: string, baseUrl = "/api"): Promise<PlayerChampion[]> {
	const client = createApiClient(baseUrl);
	const res = await client.player.me.champions.$get({}, { init: { headers: { cookie } } });
	if (!res.ok) {
		throw new Error(`fetchPlayerChampions: HTTP ${res.status}`);
	}
	return res.json();
}

export async function fetchPlayerMatches(cookie: string, baseUrl = "/api"): Promise<PlayerMatchEntry[]> {
	const client = createApiClient(baseUrl);
	const res = await client.player.me.matches.$get({}, { init: { headers: { cookie } } });
	if (!res.ok) {
		throw new Error(`fetchPlayerMatches: HTTP ${res.status}`);
	}
	return res.json();
}

import type { Champion, ChampionAbility, ChampionSkin } from "@rift/champion";

import { createApiClient } from "../api-client";

/**
 * Server-side champion fetchers for use in Next.js Server Components.
 * These are plain async functions, not React hooks.
 *
 * @param baseUrl - Internal API URL (e.g. `process.env.API_URL`). Defaults to
 *                  `/api` so calls hit the shell's API proxy in development.
 */

export async function fetchChampions(baseUrl = "/api"): Promise<Champion[]> {
	const client = createApiClient(baseUrl);
	const res = await client.champions.$get();
	if (!res.ok) {
		throw new Error(`fetchChampions: HTTP ${res.status}`);
	}
	return res.json();
}

export async function fetchChampion(id: string, baseUrl = "/api"): Promise<Champion> {
	const client = createApiClient(baseUrl);
	const res = await client.champions[":id"].$get({ param: { id } });
	if (!res.ok) {
		throw new Error(`fetchChampion(${id}): HTTP ${res.status}`);
	}
	return res.json();
}

export async function fetchChampionAbilities(id: string, baseUrl = "/api"): Promise<ChampionAbility[]> {
	const client = createApiClient(baseUrl);
	const res = await client.champions[":id"].abilities.$get({ param: { id } });
	if (!res.ok) {
		throw new Error(`fetchChampionAbilities(${id}): HTTP ${res.status}`);
	}
	return res.json();
}

export async function fetchChampionSkins(id: string, baseUrl = "/api"): Promise<ChampionSkin[]> {
	const client = createApiClient(baseUrl);
	const res = await client.champions[":id"].skins.$get({ param: { id } });
	if (!res.ok) {
		throw new Error(`fetchChampionSkins(${id}): HTTP ${res.status}`);
	}
	return res.json();
}

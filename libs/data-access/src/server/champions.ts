import type { Champion, ChampionAbility, ChampionSkin } from "@rift/champion";

import { createApiClient } from "../api-client";

export type ChampionDetail = Champion & {
	abilities: ChampionAbility[];
	skins: ChampionSkin[];
};

type RawChampionDetail = {
	champion: Champion;
	abilities: ChampionAbility[];
	skins: ChampionSkin[];
};

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
	return (await res.json()) as Champion[];
}

/**
 * Fetches a single champion with abilities and skins from `GET /champions/:id`.
 * The API returns a combined `{ champion, abilities, skins }` object.
 */
export async function fetchChampionDetail(id: string, baseUrl = "/api"): Promise<ChampionDetail> {
	const client = createApiClient(baseUrl);
	const res = await client.champions[":id"].$get({ param: { id } });
	if (!res.ok) {
		throw new Error(`fetchChampionDetail(${id}): HTTP ${res.status}`);
	}
	const { champion, abilities, skins } = (await res.json()) as RawChampionDetail;
	return { ...champion, abilities, skins };
}

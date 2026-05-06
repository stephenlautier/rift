import type { ChampionTier } from "@rift/champion";

import { createApiClient } from "../api-client";
import type { TierListFilters } from "../tier-list/tier-list.hooks";

/**
 * Server-side tier-list fetcher for use in Next.js Server Components.
 */
export async function fetchTierList(filters: TierListFilters = {}, baseUrl = "/api"): Promise<ChampionTier[]> {
	const client = createApiClient(baseUrl);
	const query: { tier?: string; role?: string; patch?: string } = {};
	if (filters.tier !== undefined) {
		query.tier = filters.tier;
	}
	if (filters.role !== undefined) {
		query.role = filters.role;
	}
	if (filters.patch !== undefined) {
		query.patch = filters.patch;
	}
	const res = await client["tier-list"].$get({ query });
	if (!res.ok) {
		throw new Error(`fetchTierList: HTTP ${res.status}`);
	}
	return (await res.json()) as ChampionTier[];
}

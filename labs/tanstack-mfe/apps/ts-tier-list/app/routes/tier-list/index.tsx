import type { ChampionRole, Tier } from "@rift/champion";
import { fetchChampions, fetchTierList } from "@rift/data-access";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { JSX } from "react";

import { parseRole, parseTier } from "@/tier-list/parse-filters";
import type { RoleFilter, TierFilter } from "@/tier-list/parse-filters";
import { TierListView } from "@/tier-list/TierListView";

const API_URL = process.env.API_URL ?? "http://localhost:3100";

type SearchParams = {
	tier?: string;
	role?: string;
	patch?: string;
};

type TierListLoaderData = {
	entries: {
		id: string;
		tier: Tier;
		role: ChampionRole;
		patch: string;
		winRate: number;
		pickRate: number;
		champion: {
			id: string;
			name: string;
			splashArtUrl: string;
		};
	}[];
	patches: string[];
	latestPatch: string;
	tierFilter: TierFilter;
	roleFilter: RoleFilter;
	patchFilter: string;
};

/**
 * Server function fetches champions + tier list and enriches tier entries
 * with champion metadata. Runs on the server; result is serialized and
 * streamed to the client as part of SSR.
 */
const fetchTierListData = createServerFn()
	.inputValidator((search: SearchParams) => search)
	.handler(async ({ data: search }): Promise<TierListLoaderData> => {
		const [tierList, champions] = await Promise.all([fetchTierList({}, API_URL), fetchChampions(API_URL)]);

		const byId = new Map(champions.map(c => [c.id, c]));

		const allEntries = tierList.flatMap(t => {
			const champion = byId.get(t.championId);
			if (!champion) {
				return [];
			}
			return [
				{
					id: t.id,
					tier: t.tier,
					role: t.role,
					patch: String(t.patch),
					winRate: t.winRate,
					pickRate: t.pickRate,
					champion: {
						id: champion.id,
						name: champion.name,
						splashArtUrl: champion.splashArtUrl,
					},
				},
			];
		});

		const patches = [...new Set(allEntries.map(e => e.patch))]
			.toSorted((a, b) => a.localeCompare(b, undefined, { numeric: true }))
			.toReversed();

		const latestPatch = patches[0] ?? "";
		const tierFilter = parseTier(search.tier);
		const roleFilter = parseRole(search.role);
		const patchFilter = search.patch ?? "latest";
		const effectivePatch = patchFilter === "latest" ? latestPatch : patchFilter;

		// Pre-filter on the server so SSR HTML already contains only matching rows
		const entries = allEntries.filter(e => {
			if (tierFilter !== "all" && e.tier !== tierFilter) {
				return false;
			}
			if (roleFilter !== "all" && e.role !== roleFilter) {
				return false;
			}
			if (effectivePatch && e.patch !== effectivePatch) {
				return false;
			}
			return true;
		});

		return { entries, patches, tierFilter, roleFilter, patchFilter, latestPatch };
	});

export const Route = createFileRoute("/tier-list/")({
	head: () => ({ meta: [{ title: "Tier List" }] }),
	validateSearch: (search: Record<string, unknown>): SearchParams => ({
		tier: typeof search.tier === "string" ? search.tier : undefined,
		role: typeof search.role === "string" ? search.role : undefined,
		patch: typeof search.patch === "string" ? search.patch : undefined,
	}),
	/**
	 * Loader calls the server function with current search params.
	 * TanStack Router re-runs the loader when search params change,
	 * giving URL-driven SSR filtering (filters are bookmarkable).
	 */
	loader: ({ location }) =>
		fetchTierListData({
			data: {
				tier: location.search.tier,
				role: location.search.role,
				patch: location.search.patch,
			},
		}),
	component: TierListPage,
});

function TierListPage(): JSX.Element {
	const { entries, patches, tierFilter, roleFilter, patchFilter, latestPatch } = Route.useLoaderData();
	return (
		<TierListView
			entries={entries}
			patches={patches}
			initialTier={tierFilter}
			initialRole={roleFilter}
			initialPatch={patchFilter}
			latestPatch={latestPatch}
		/>
	);
}

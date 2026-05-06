import { fetchChampions, fetchTierList } from "@rift/data-access";
import type { Metadata } from "next";
import type { JSX } from "react";

import { API_URL } from "@/env";
import { parseRole, parseTier } from "@/tier-list/parse-filters";
import { TierListView } from "@/tier-list/TierListView";

export const metadata: Metadata = { title: "Tier List" };

type SearchParams = Promise<{ tier?: string; role?: string; patch?: string }>;

export default async function TierListPage({ searchParams }: { searchParams: SearchParams }): Promise<JSX.Element> {
	const { tier: tierParam, role: roleParam, patch: patchParam } = await searchParams;

	const [tierList, champions] = await Promise.all([fetchTierList({}, API_URL), fetchChampions(API_URL)]);

	const byId = new Map(champions.map(c => [c.id, c]));

	const allEntries = tierList.flatMap(t => {
		const champion = byId.get(t.championId);
		if (!champion) {
			return [];
		}
		return [
			{
				...t,
				champion: {
					id: champion.id,
					name: champion.name,
					splashArtUrl: champion.splashArtUrl,
					roles: champion.roles,
				},
			},
		];
	});

	const patches = [...new Set(allEntries.map(e => String(e.patch)))]
		.toSorted((a, b) => a.localeCompare(b, undefined, { numeric: true }))
		.toReversed();

	const latestPatch = patches[0] ?? "";
	const tierFilter = parseTier(tierParam);
	const roleFilter = parseRole(roleParam);
	const patchFilter = patchParam ?? "latest";
	const effectivePatch = patchFilter === "latest" ? latestPatch : patchFilter;

	const entries = allEntries.filter(e => {
		if (tierFilter !== "all" && e.tier !== tierFilter) {
			return false;
		}
		if (roleFilter !== "all" && e.role !== roleFilter) {
			return false;
		}
		if (effectivePatch && String(e.patch) !== effectivePatch) {
			return false;
		}
		return true;
	});

	return (
		<TierListView
			entries={entries}
			patches={patches}
			tierFilter={tierFilter}
			roleFilter={roleFilter}
			patchFilter={patchFilter}
			latestPatch={latestPatch}
		/>
	);
}

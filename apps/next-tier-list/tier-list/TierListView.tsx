import type { ChampionRole, Tier } from "@rift/champion";
import { Suspense } from "react";
import type { ReactElement } from "react";

import { TierListFilters } from "./TierListFilters";
import { TierRow } from "./TierRow";
import type { EnrichedTierEntry } from "./types";

const TIER_ORDER: Tier[] = ["S", "A", "B", "C", "D"];
const EMPTY_ENTRIES: EnrichedTierEntry[] = [];

type Props = {
	entries: EnrichedTierEntry[];
	patches: string[];
	tierFilter: Tier | "all";
	roleFilter: ChampionRole | "all";
	patchFilter: string;
	latestPatch: string;
};

export function TierListView({
	entries,
	patches,
	tierFilter,
	roleFilter,
	patchFilter,
	latestPatch,
}: Props): ReactElement {
	const byTier = new Map<Tier, EnrichedTierEntry[]>();
	for (const tier of TIER_ORDER) {
		byTier.set(tier, []);
	}
	for (const entry of entries) {
		byTier.get(entry.tier)?.push(entry);
	}

	const displayPatch = patchFilter === "latest" ? latestPatch : patchFilter;
	const firstNonEmptyTier = TIER_ORDER.find(t => (byTier.get(t)?.length ?? 0) > 0);

	// oxlint-disable-next-line react-perf/jsx-no-jsx-as-prop -- Server Component; renders once per request, no reconciliation cost
	const filtersFallback = (
		<div className="h-[104px] rounded-xl border border-border bg-card mb-8 animate-pulse" aria-hidden="true" />
	);

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight">Tier List</h1>
				<p className="mt-1 text-muted-foreground">
					Patch {displayPatch} — {entries.length} champion/role combinations
				</p>
			</div>

			<Suspense fallback={filtersFallback}>
				<TierListFilters patches={patches} tierFilter={tierFilter} roleFilter={roleFilter} patchFilter={patchFilter} />
			</Suspense>

			{entries.length === 0 ? (
				<p className="text-center text-muted-foreground py-16">No champions match these filters.</p>
			) : (
				<div className="space-y-6">
					{TIER_ORDER.map(tier => (
						<TierRow
							key={tier}
							tier={tier}
							entries={byTier.get(tier) ?? EMPTY_ENTRIES}
							isFirstRow={tier === firstNonEmptyTier}
						/>
					))}
				</div>
			)}
		</div>
	);
}

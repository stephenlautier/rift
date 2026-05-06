"use client";

import type { ChampionRole, Tier } from "@rift/champion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { ReactElement } from "react";

import { FilterButton } from "./FilterButton";

const TIERS: (Tier | "all")[] = ["all", "S", "A", "B", "C", "D"];
const ROLES: (ChampionRole | "all")[] = ["all", "Top", "Jungle", "Mid", "ADC", "Support"];

const TIER_COLORS: Record<string, string> = {
	S: "border-amber-400 bg-amber-400/10 text-amber-400",
	A: "border-purple-400 bg-purple-400/10 text-purple-400",
	B: "border-blue-400 bg-blue-400/10 text-blue-400",
	C: "border-green-400 bg-green-400/10 text-green-400",
	D: "border-gray-400 bg-gray-400/10 text-gray-400",
	all: "border-border bg-muted/50 text-foreground",
};

const TIER_INACTIVE = "border-border text-muted-foreground hover:border-current hover:text-foreground";
const ROLE_ACTIVE = "border-primary bg-primary/10 text-primary ring-1 ring-primary";
const ROLE_INACTIVE = "border-border text-muted-foreground hover:border-foreground hover:text-foreground";

type Props = {
	patches: string[];
	tierFilter: Tier | "all";
	roleFilter: ChampionRole | "all";
	patchFilter: string;
};

export function TierListFilters({ patches, tierFilter, roleFilter, patchFilter }: Props): ReactElement {
	const router = useRouter();
	const searchParams = useSearchParams();

	const setFilter = useCallback(
		(key: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			if (value === "all" || value === "latest") {
				params.delete(key);
			} else {
				params.set(key, value);
			}
			router.push(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams],
	);

	const setTier = useCallback((t: Tier | "all") => setFilter("tier", t), [setFilter]);
	const setRole = useCallback((r: ChampionRole | "all") => setFilter("role", r), [setFilter]);
	const setPatch = useCallback((p: string) => setFilter("patch", p), [setFilter]);

	return (
		<div className="space-y-3 mb-8 p-4 rounded-xl border border-border bg-card">
			<div>
				<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tier</p>
				<div className="flex flex-wrap gap-2">
					{TIERS.map(t => (
						<FilterButton
							key={t}
							value={t}
							active={tierFilter === t}
							onSelect={setTier}
							className={`px-3 py-1 rounded-md text-sm font-semibold border transition-colors ${
								tierFilter === t ? `${TIER_COLORS[t]} ring-1 ring-current` : TIER_INACTIVE
							}`}>
							{t === "all" ? "All Tiers" : t}
						</FilterButton>
					))}
				</div>
			</div>

			<div>
				<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Role</p>
				<div className="flex flex-wrap gap-2">
					{ROLES.map(r => (
						<FilterButton
							key={r}
							value={r}
							active={roleFilter === r}
							onSelect={setRole}
							className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
								roleFilter === r ? ROLE_ACTIVE : ROLE_INACTIVE
							}`}>
							{r === "all" ? "All Roles" : r}
						</FilterButton>
					))}
				</div>
			</div>

			{patches.length > 1 && (
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Patch</p>
					<div className="flex flex-wrap gap-2">
						<FilterButton
							value="latest"
							active={patchFilter === "latest"}
							onSelect={setPatch}
							className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
								patchFilter === "latest" ? ROLE_ACTIVE : ROLE_INACTIVE
							}`}>
							Latest
						</FilterButton>
						{patches.map(p => (
							<FilterButton
								key={p}
								value={p}
								active={patchFilter === p}
								onSelect={setPatch}
								className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
									patchFilter === p ? ROLE_ACTIVE : ROLE_INACTIVE
								}`}>
								{p}
							</FilterButton>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

import type { ChampionRole, Tier } from "@rift/champion";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { ChangeEvent, JSX, MouseEvent } from "react";
import { useCallback } from "react";

import type { RoleFilter, TierFilter } from "./parse-filters";

/** Jotai atoms for tier list filter state — persisted in sessionStorage. */
export const tierAtom = atomWithStorage<TierFilter>("rift-tier-filter", "all");
export const roleAtom = atomWithStorage<RoleFilter>("rift-role-filter", "all");
export const patchAtom = atomWithStorage<string>("rift-patch-filter", "latest");

type TierEntry = {
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
};

type TierListViewProps = {
	entries: TierEntry[];
	patches: string[];
	initialTier: TierFilter;
	initialRole: RoleFilter;
	initialPatch: string;
};

const TIERS: Tier[] = ["S", "A", "B", "C", "D"];
const ROLES: ChampionRole[] = ["Top", "Jungle", "Mid", "ADC", "Support"];

const TIER_COLORS: Record<Tier, string> = {
	S: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
	A: "text-green-500 bg-green-500/10 border-green-500/30",
	B: "text-blue-500 bg-blue-500/10 border-blue-500/30",
	C: "text-orange-500 bg-orange-500/10 border-orange-500/30",
	D: "text-red-500 bg-red-500/10 border-red-500/30",
};

/**
 * Client-side tier list view with Jotai filter state.
 *
 * The server loader already filtered data using URL search params — this
 * component handles UX refinement (instant filter toggle) without another
 * round trip. The atomWithStorage ensures filters survive navigation within
 * the tier-list zone.
 */
export function TierListView({
	entries,
	patches,
	initialTier,
	initialRole,
	initialPatch,
}: TierListViewProps): JSX.Element {
	const [tier, setTier] = useAtom(tierAtom);
	const [role, setRole] = useAtom(roleAtom);
	const [patch, setPatch] = useAtom(patchAtom);

	// Sync atoms with SSR-resolved values on first render
	const effectiveTier = tier === "all" ? initialTier : tier;
	const effectiveRole = role === "all" ? initialRole : role;
	const effectivePatch = patch === "latest" ? initialPatch : patch;

	const filtered = entries.filter(e => {
		if (effectiveTier !== "all" && e.tier !== effectiveTier) {
			return false;
		}
		if (effectiveRole !== "all" && e.role !== effectiveRole) {
			return false;
		}
		if (effectivePatch && e.patch !== effectivePatch) {
			return false;
		}
		return true;
	});

	// Stable event-delegation handlers — read filter value from data-* attribute
	const handleTierClick = useCallback(
		(e: MouseEvent<HTMLButtonElement>): void => {
			const val = e.currentTarget.dataset.tier as TierFilter | undefined;
			if (val) {
				setTier(val);
			}
		},
		[setTier],
	);

	const handleRoleClick = useCallback(
		(e: MouseEvent<HTMLButtonElement>): void => {
			const val = e.currentTarget.dataset.role as RoleFilter | undefined;
			if (val) {
				setRole(val);
			}
		},
		[setRole],
	);

	const handlePatchChange = useCallback(
		(e: ChangeEvent<HTMLSelectElement>): void => {
			setPatch(e.target.value);
		},
		[setPatch],
	);

	return (
		<div className="space-y-6">
			{/* Filter bar */}
			<div className="flex flex-wrap gap-3">
				{/* Tier filter */}
				<div className="flex items-center gap-1.5">
					<span className="text-xs font-medium text-muted-foreground">Tier</span>
					{(["all", ...TIERS] as (TierFilter | "all")[]).map(t => (
						<button
							key={t}
							type="button"
							data-tier={t}
							onClick={handleTierClick}
							className={`text-xs px-2 py-1 rounded border transition-colors ${
								effectiveTier === t
									? "bg-primary text-primary-foreground border-primary"
									: "border-border text-muted-foreground hover:text-foreground"
							}`}>
							{t === "all" ? "All" : t}
						</button>
					))}
				</div>
				{/* Role filter */}
				<div className="flex items-center gap-1.5">
					<span className="text-xs font-medium text-muted-foreground">Role</span>
					{(["all", ...ROLES] as (RoleFilter | "all")[]).map(r => (
						<button
							key={r}
							type="button"
							data-role={r}
							onClick={handleRoleClick}
							className={`text-xs px-2 py-1 rounded border transition-colors ${
								effectiveRole === r
									? "bg-primary text-primary-foreground border-primary"
									: "border-border text-muted-foreground hover:text-foreground"
							}`}>
							{r === "all" ? "All" : r}
						</button>
					))}
				</div>
				{/* Patch filter */}
				<div className="flex items-center gap-1.5">
					<span className="text-xs font-medium text-muted-foreground">Patch</span>
					<select
						value={effectivePatch}
						onChange={handlePatchChange}
						className="text-xs rounded border border-border bg-background px-2 py-1">
						<option value="latest">Latest</option>
						{patches.map(p => (
							<option key={p} value={p}>
								{p}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Results count */}
			<p className="text-sm text-muted-foreground">{filtered.length} entries</p>

			{/* Tier list rows */}
			<div className="space-y-1">
				{filtered.map(entry => (
					<div
						key={entry.id}
						className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors">
						<span
							className={`text-sm font-bold w-8 text-center rounded border ${TIER_COLORS[entry.tier] ?? ""} py-0.5`}>
							{entry.tier}
						</span>
						<img
							src={entry.champion.splashArtUrl}
							alt={entry.champion.name}
							className="h-8 w-8 rounded-full object-cover object-top"
						/>
						{/* Cross-zone link to champion detail */}
						<a href={`/champions/${entry.champion.id}`} className="font-medium hover:underline flex-1">
							{entry.champion.name}
						</a>
						<span className="text-xs text-muted-foreground">{entry.role}</span>
						<span className="text-xs text-muted-foreground">{(entry.winRate * 100).toFixed(1)}% WR</span>
						<span className="text-xs text-muted-foreground">{(entry.pickRate * 100).toFixed(1)}% PR</span>
					</div>
				))}
			</div>
		</div>
	);
}
